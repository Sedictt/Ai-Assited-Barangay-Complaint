import os
import argparse
import pandas as pd
import joblib
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler

# try to import oversampling helper (optional)
try:
    from imblearn.over_sampling import SMOTE
    HAS_IMBLEARN = True
except Exception:
    HAS_IMBLEARN = False

def prepare_df(path="data.csv"):
    df = pd.read_csv(path)
    
    # Clean and encode categorical features
    for col in ["category", "severity"]:
        df[col] = df[col].fillna("Unknown").astype(str).str.strip()

    min_count = 3
    cat_counts = df["category"].value_counts()
    rare_cats = cat_counts[cat_counts < min_count].index
    if len(rare_cats) > 0:
        df["category"] = df["category"].where(~df["category"].isin(rare_cats), other="Other")

    for col in ["category", "severity"]:
        df[f"{col}_codes"] = df[col].astype("category").cat.codes
    
    # Store label mappings
    label_mappings = {
        "category": dict(enumerate(df["category"].astype("category").cat.categories)),
        "severity": dict(enumerate(df["severity"].astype("category").cat.categories))
    }
    
    # ENHANCEMENT 1: Add text features
    df['text_length'] = df['complaint_text'].astype(str).str.len()
    df['word_count'] = df['complaint_text'].astype(str).str.split().str.len()
    
    # ENHANCEMENT 2: Add keyword features for common patterns
    keywords = {
        'water': ['tubig', 'nawalan ng tubig'],
        'electricity': ['brownout', 'kuryente', 'ilaw'],
        'garbage': ['basura', 'garbage', 'kanal'],
        'noise': ['ingay', 'karaoke', 'malakas'],
        'crime': ['nakawan', 'ninakaw', 'lasing'],
        'fire': ['sunog', 'apoy'],
        'flood': ['baha', 'flooding'],
        'road': ['butas', 'kalsada', 'street']
    }
    
    for key, terms in keywords.items():
        pattern = '|'.join(terms)
        df[f'has_{key}'] = df['complaint_text'].str.lower().str.contains(pattern, na=False).astype(int)

    sev_to_prio = {"critical": 1, "high": 1, "medium": 2, "low": 3}
    df["recommended_priority"] = df["severity"].str.lower().map(sev_to_prio).fillna(2).astype(int)
    
    return df, label_mappings

def create_enhanced_features(X_text, embedder, df_features, batch_size=32):
    """Combine embeddings with hand-crafted features"""
    # Get text embeddings
    embeddings = embedder.encode(X_text.tolist(), batch_size=batch_size, 
                                show_progress_bar=True, convert_to_numpy=True)
    
    # Get additional features
    feature_cols = ['text_length', 'word_count'] + [c for c in df_features.columns if c.startswith('has_')]
    additional_features = df_features[feature_cols].values
    
    # Combine embeddings with features
    X_combined = np.hstack([embeddings, additional_features])
    
    return X_combined

def train(args):
    df, label_mappings = prepare_df(args.data)
    label_mappings["embedder_model"] = args.embedder
    
    print(f"Dataset shape: {df.shape}")
    print(f"\nClass distributions:")
    print(f"Category: {df['category'].value_counts().to_dict()}")
    print(f"Severity: {df['severity'].value_counts().to_dict()}")
    print(f"Priority: {df['recommended_priority'].value_counts().to_dict()}")
    
    X = df["complaint_text"].astype(str)
    y = df[["category_codes", "severity_codes"]]
    
    # Split with stratification on category (most important)
    cat_counts = df["category_codes"].value_counts()
    if cat_counts.min() < 2:
        print("\nWarning: Some categories have only 1 sample; disabling stratified split.")
        stratify_labels = None
    else:
        stratify_labels = df["category_codes"]

    X_train_text, X_test_text, y_train, y_test, df_train, df_test = train_test_split(
        X, y, df, test_size=args.test_size, random_state=42, stratify=stratify_labels
    )
    
    print(f"\nTrain size: {len(X_train_text)}, Test size: {len(X_test_text)}")
    
    # ENHANCEMENT 3: Use multilingual embedder
    print(f"\nLoading embedder: {args.embedder}")
    embedder = SentenceTransformer(args.embedder)
    
    # Create enhanced features
    print("\nCreating enhanced features...")
    X_train = create_enhanced_features(X_train_text, embedder, df_train, args.batch_size)
    X_test = create_enhanced_features(X_test_text, embedder, df_test, args.batch_size)
    
    # ENHANCEMENT 4: Scale features
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    
    # Train separate classifiers per target
    models = {}
    
    def fit_model(Xtr, ytr, clf, task_name):
        """Fit model with optional SMOTE oversampling"""
        if HAS_IMBLEARN and len(np.unique(ytr)) > 1:
            try:
                # Use SMOTE for better synthetic samples
                smote = SMOTE(random_state=42, k_neighbors=min(5, len(ytr)//len(np.unique(ytr)) - 1))
                Xr, yr = smote.fit_resample(Xtr, ytr)
                print(f"  {task_name}: Applied SMOTE - {len(ytr)} -> {len(yr)} samples")
            except Exception as e:
                print(f"  {task_name}: SMOTE failed ({e}), using original data")
                Xr, yr = Xtr, ytr
        else:
            Xr, yr = Xtr, ytr
        
        clf.fit(Xr, yr)
        
        # Cross-validation score on original training data
        if len(Xtr) > 30:
            cv_score = cross_val_score(clf, Xtr, ytr, cv=min(5, len(Xtr)//50), scoring='f1_weighted').mean()
            print(f"  {task_name}: CV F1-score = {cv_score:.3f}")
        
        return clf
    
    # ENHANCEMENT 5: Better classifiers with tuned hyperparameters
    print("\nTraining classifiers...")
    
    # Category - use Gradient Boosting for better performance
    y_train_cat = y_train["category_codes"].values
    clf_cat = GradientBoostingClassifier(
        n_estimators=200, 
        learning_rate=0.1, 
        max_depth=5,
        min_samples_split=10,
        random_state=42
    )
    models["category"] = fit_model(X_train, y_train_cat, clf_cat, "Category")
    
    # Severity
    y_train_sev = y_train["severity_codes"].values
    clf_sev = GradientBoostingClassifier(
        n_estimators=150,
        learning_rate=0.1,
        max_depth=4,
        random_state=42
    )
    models["severity"] = fit_model(X_train, y_train_sev, clf_sev, "Severity")
    
    # Evaluate each
    print("\n" + "="*60)
    print("MODEL PERFORMANCE ON TEST SET")
    print("="*60)
    
    for name, clf in [("category", models["category"]), 
                      ("severity", models["severity"])]:
        key = "category_codes" if name == "category" else "severity_codes"
        ytrue = y_test[key]
        
        ypred = clf.predict(X_test)
        
        print(f"\n{name.upper()} Classification Report:")
        print(classification_report(ytrue, ypred, zero_division=0))
        
        # Show confusion matrix for top issues
        cm = confusion_matrix(ytrue, ypred)
        print(f"Confusion matrix shape: {cm.shape}")
    
    # Save everything
    save_dict = {
        'models': models,
        'scaler': scaler,
        'label_mappings': label_mappings
    }
    joblib.dump(save_dict, "models.pkl")
    print("\n" + "="*60)
    print("Training completed! Saved models.pkl")
    print("="*60)
    
    return models, scaler, label_mappings

def predict_text(args):
    if not os.path.exists("models.pkl"):
        print("models.pkl not found. Run training first: python train.py --train")
        return
    
    save_dict = joblib.load("models.pkl")
    models = save_dict['models']
    scaler = save_dict['scaler']
    mappings = save_dict['label_mappings']
    
    embedder_name = mappings.get("embedder_model", args.embedder)
    embedder = SentenceTransformer(embedder_name)
    
    txt = args.predict
    
    # Create a mini dataframe for feature extraction
    mini_df = pd.DataFrame({'complaint_text': [txt]})
    mini_df['text_length'] = mini_df['complaint_text'].str.len()
    mini_df['word_count'] = mini_df['complaint_text'].str.split().str.len()
    
    # Add keyword features
    keywords = {
        'water': ['tubig', 'nawalan ng tubig'],
        'electricity': ['brownout', 'kuryente', 'ilaw'],
        'garbage': ['basura', 'garbage', 'kanal'],
        'noise': ['ingay', 'karaoke', 'malakas'],
        'crime': ['nakawan', 'ninakaw', 'lasing'],
        'fire': ['sunog', 'apoy'],
        'flood': ['baha', 'flooding'],
        'road': ['butas', 'kalsada', 'street']
    }
    
    for key, terms in keywords.items():
        pattern = '|'.join(terms)
        mini_df[f'has_{key}'] = mini_df['complaint_text'].str.lower().str.contains(pattern, na=False).astype(int)
    
    # Get embeddings
    emb = embedder.encode([txt], convert_to_numpy=True)
    
    # Combine with features
    feature_cols = ['text_length', 'word_count'] + [c for c in mini_df.columns if c.startswith('has_')]
    additional_features = mini_df[feature_cols].values
    X = np.hstack([emb, additional_features])
    
    # Scale
    X = scaler.transform(X)
    
    # Predict
    category_pred = models["category"].predict(X)[0]
    severity_pred = models["severity"].predict(X)[0]
    
    # Decode predictions
    category_map = mappings["category"]
    severity_map = mappings["severity"]
    category = category_map.get(int(category_pred), str(category_pred))
    severity = severity_map.get(int(severity_pred), str(severity_pred))

    sev_lower = str(severity).lower()
    if sev_lower in ("critical", "high"):
        priority = 1
    elif sev_lower == "medium":
        priority = 2
    else:
        priority = 3
    
    print("\n" + "="*60)
    print("PREDICTION RESULT")
    print("="*60)
    print(f"Input: {txt}")
    print(f"\nCategory: {category}")
    print(f"Severity: {severity}")
    print(f"Priority: {priority}")
    print("="*60)

def cli():
    parser = argparse.ArgumentParser(description="Train or predict using sentence-transformers + MultiOutput classifier")
    parser.add_argument("--data", default="data.csv", help="CSV dataset path")
    # CRITICAL: Use multilingual model for Filipino text
    parser.add_argument("--embedder", default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2", 
                       help="sentence-transformers model name (use multilingual for Filipino)")
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--predict", type=str, help="if provided, loads models.pkl and predicts this text")
    parser.add_argument("--train", action="store_true", help="force training (default if --predict not set)")
    args = parser.parse_args()
    
    if args.predict:
        predict_text(args)
    else:
        train(args)
        print("\nNext steps:")
        print(" - To predict: python train.py --predict \"May sunog na amoy sa kanto\"")
        print(" - Required: pip install sentence-transformers scikit-learn joblib pandas imbalanced-learn")

if __name__ == "__main__":
    cli()