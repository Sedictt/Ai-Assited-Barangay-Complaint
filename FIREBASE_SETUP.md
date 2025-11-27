# Firebase Setup Instructions

To make the application work, you need to set up a Firebase project and enable Firestore and Storage.

## 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it `barangay-complaint-ps` (or any name you prefer).
3. Disable Google Analytics for this prototype (optional).
4. Click **Create project**.

## 2. Enable Firestore Database
1. In the project dashboard, go to **Build** > **Firestore Database**.
2. Click **Create database**.
3. Select **Start in test mode** (this allows read/write access for development).
   - *Note: For production, you will need to configure security rules.*
4. Select a location (e.g., `asia-southeast1` for Singapore/Philippines).
5. Click **Enable**.

## 3. Enable Firebase Storage
1. In the project dashboard, go to **Build** > **Storage**.
2. Click **Get Started**.
3. Select **Start in test mode**.
4. Click **Next** and then **Done**.

## 4. Verify Configuration
Ensure your `services/firebase.ts` file matches the configuration from your Firebase project settings if you used a different project.
(The current configuration is a placeholder or a specific test project. If you created your own, update the keys in `services/firebase.ts`).

## 5. Test the App
1. Run `npm run dev`.
2. Open `http://localhost:3000` (or the port shown in terminal).
3. As a **Resident**: Submit a complaint with photos.
4. As an **Official**: Verify the complaint appears and photos can be viewed.
