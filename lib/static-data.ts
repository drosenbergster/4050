import { Product } from './types';

export const STATIC_PRODUCTS: (Product & { category: string })[] = [
    { 
        id: 'prod_1', 
        name: 'Classic Applesauce', 
        description: "The heritage trees at 4050 don't ask for permission to be generous. This is the smooth, honest taste of a PNW autumn.", 
        price: 899, 
        imageUrl: 'https://images.unsplash.com/photo-1590005354167-6da97870c91d?q=80&w=800&auto=format&fit=crop', 
        isAvailable: true, 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        category: 'Applesauces' 
    },
    { 
        id: 'prod_2', 
        name: 'Sugar-Free Applesauce', 
        description: 'Exactly as the garden provided. No extra sweetness needed when the morning mist and afternoon sun have already done the work.', 
        price: 899, 
        imageUrl: 'https://images.unsplash.com/photo-1590005354167-6da97870c91d?q=80&w=800&auto=format&fit=crop', 
        isAvailable: true, 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        category: 'Applesauces' 
    },
    { 
        id: 'prod_3', 
        name: 'Apple Rings', 
        description: 'Thinly sliced memories of the orchard, dried slowly by the kitchen window. A concentrated crunch of the Pacific Northwest autumn.', 
        price: 799, 
        imageUrl: 'https://images.unsplash.com/photo-1591871937573-74dbba515c4c?q=80&w=800&auto=format&fit=crop', 
        isAvailable: true, 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        category: 'Dried Goods' 
    },
    { 
        id: 'prod_4', 
        name: 'Apple Butter', 
        description: "A concentrated harvest. We take the abundance of our two oldest trees and slow-cook it until it's dark, rich, and honest.", 
        price: 1099, 
        imageUrl: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=800&auto=format&fit=crop', 
        isAvailable: true, 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        category: 'Spreads' 
    },
    { 
        id: 'prod_5', 
        name: 'Apple Chips', 
        description: 'Crispy, sun-kissed slices of our backyard bounty. Simple and honest, like a conversation on a porch swing.', 
        price: 699, 
        imageUrl: 'https://images.unsplash.com/photo-1591871937573-74dbba515c4c?q=80&w=800&auto=format&fit=crop', 
        isAvailable: true, 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        category: 'Dried Goods' 
    },
    { 
        id: 'prod_6', 
        name: 'Raspberry Jam', 
        description: 'From the wild brambles that insisted on growing over the garden fence. Bright, tart, and bursting with summer energy.', 
        price: 1199, 
        imageUrl: 'https://images.unsplash.com/photo-1502741126161-b048400d085d?q=80&w=800&auto=format&fit=crop', 
        isAvailable: true, 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        category: 'Jams' 
    },
    { 
        id: 'prod_7', 
        name: 'Blueberry Jam', 
        description: "The garden was particularly kind this July. We've preserved that generosity in every jar—fat, sun-warmed berries.", 
        price: 1199, 
        imageUrl: 'https://images.unsplash.com/photo-1464965211914-c7145edb918c?q=80&w=800&auto=format&fit=crop', 
        isAvailable: true, 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        category: 'Jams' 
    },
    { 
        id: 'prod_8', 
        name: 'Apple Jam', 
        description: "A different way to celebrate what the heritage trees gave us this year. Ilene's secret recipe, spiked with a touch of cinnamon.", 
        price: 1099, 
        imageUrl: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=800&auto=format&fit=crop', 
        isAvailable: true, 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        category: 'Jams' 
    },
    { 
        id: 'prod_9', 
        name: 'Pickled Green Beans', 
        description: 'The garden gave us more beans than we could eat fresh, so we honored their crunch with a tangy, savory brine.', 
        price: 999, 
        imageUrl: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=800&auto=format&fit=crop', 
        isAvailable: true, 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        category: 'Pickled Goods' 
    },
    { 
        id: 'prod_10', 
        name: 'Classic Dill Pickles', 
        description: 'Straight from the dark PNW soil to the pickling jar. Honest, crunchy, and packed with garden herbs.', 
        price: 999, 
        imageUrl: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=800&auto=format&fit=crop', 
        isAvailable: true, 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        category: 'Pickled Goods' 
    },
];
