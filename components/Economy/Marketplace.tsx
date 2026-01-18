import React, { useEffect, useState } from 'react';
import { MarketplaceItem } from '../../types';
import { subscribeToMarketplaceItems } from '../../services/firestoreService';
import { ShoppingBag, Search, Filter, Image } from '../Icons';

const Marketplace: React.FC = () => {
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToMarketplaceItems((data) => {
            setItems(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading marketplace...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Maysan Marketplace</h2>
                    <p className="text-gray-500">Support local businesses. Buy and sell within the community.</p>
                </div>
                <button className="px-6 py-2.5 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Sell Item
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search for food, services, or items..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                />
            </div>

            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-1"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Image Placeholder */}
                        <div className="aspect-square bg-gray-100 relative flex items-center justify-center overflow-hidden">
                            {item.images && item.images.length > 0 ? (
                                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-gray-300">
                                    <Image className="w-12 h-12" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                                </div>
                            )}
                            <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg uppercase tracking-wider border border-white/10">
                                {item.category}
                            </div>

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                        </div>

                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900 truncate pr-2 group-hover:text-amber-700 transition-colors">{item.title}</h3>
                            </div>
                            <p className="text-lg font-black text-amber-600 mb-3">₱{item.price}</p>

                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-200">
                                    {item.sellerName.charAt(0)}
                                </div>
                                <p className="text-xs text-gray-500 truncate font-medium">{item.sellerName}</p>
                            </div>

                            <button className="w-full py-2.5 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Marketplace;
