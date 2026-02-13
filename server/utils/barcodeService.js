import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const UPCITEMDB_API_KEY = process.env.UPCITEMDB_API_KEY;
const BARCODE_LOOKUP_API_KEY = process.env.BARCODE_LOOKUP_API_KEY;

/**
 * Lookup product details using barcode from multiple APIs in sequence.
 * @param {string} barcode 
 * @returns {Promise<Object|null>} Product details or null if not found
 */
export const lookupBarcode = async (barcode) => {
    if (!barcode) return null;

    let productDetails = null;

    // 1. Try OpenFoodFacts
    try {
        const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        if (response.data && response.data.status === 1) {
            const product = response.data.product;
            productDetails = {
                name: product.product_name || product.product_name_en || "Unknown Product",
                brand: product.brands || "",
                image: product.image_front_url || product.image_url || "",
                description: product.generic_name || "",
                price: "" // OpenFoodFacts usually doesn't have current market price
            };
            if (productDetails.name !== "Unknown Product") {
                console.log("Product found via OpenFoodFacts.");
                return productDetails;
            }
        }
    } catch (error) {
        console.error(`OpenFoodFacts lookup failed for ${barcode}:`, error.message);
    }

    // 2. Try UPCitemDB
    if (UPCITEMDB_API_KEY) {
        try {
            const response = await axios.get(`https://api.upcitemdb.com/prod/v1/lookup?upc=${barcode}`, {
                headers: { "key": UPCITEMDB_API_KEY }
            });
            if (response.data && response.data.items && response.data.items.length > 0) {
                const item = response.data.items[0];
                productDetails = {
                    name: item.title || "Unknown Product",
                    brand: item.brand || "",
                    image: item.images && item.images.length > 0 ? item.images[0] : "",
                    description: item.description || "",
                    price: item.lowest_recorded_price || item.highest_recorded_price || ""
                };
                console.log("Product found via UPCitemDB.");
                return productDetails;
            }
        } catch (error) {
            console.error(`UPCitemDB lookup failed for ${barcode}:`, error.message);
        }
    } else {
        console.warn("UPCITEMDB_API_KEY is not set. Skipping UPCitemDB lookup.");
    }

    // 3. Try Barcode Lookup API
    if (BARCODE_LOOKUP_API_KEY) {
        try {
            const response = await axios.get(`https://api.barcodelookup.com/v3/products?barcode=${barcode}&key=${BARCODE_LOOKUP_API_KEY}`);
            if (response.data && response.data.products && response.data.products.length > 0) {
                const product = response.data.products[0];
                productDetails = {
                    name: product.product_name || "Unknown Product",
                    brand: product.brand || "",
                    image: product.images && product.images.length > 0 ? product.images[0] : "",
                    description: product.description || "",
                    price: product.stores && product.stores.length > 0 ? product.stores[0].price : ""
                };
                console.log("Product found via Barcode Lookup API.");
                return productDetails;
            }
        } catch (error) {
            console.error(`Barcode Lookup API failed for ${barcode}:`, error.message);
        }
    } else {
        console.warn("BARCODE_LOOKUP_API_KEY is not set. Skipping Barcode Lookup API.");
    }

    console.log("No product found for barcode:", barcode);
    return null;
};
