const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');

// Firebase configuration from your .env.local
const firebaseConfig = {
  apiKey: "AIzaSyDcBmNXdT_cdiBEDQhAfsOKhNH17EpfIWQ",
  authDomain: "guru-ee9f7.firebaseapp.com",
  projectId: "guru-ee9f7",
  storageBucket: "guru-ee9f7.firebasestorage.app",
  messagingSenderId: "455506336446",
  appId: "1:455506336446:web:cfa2b805aa97065a491cef",
  measurementId: "G-2R2BYPZRBL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkStore(storeName) {
  try {
    console.log(`Checking store name: ${storeName}`);
    
    // Check if store name exists in storeNames collection
    const storeNamesRef = collection(db, 'storeNames');
    const q = query(storeNamesRef, where('__name__', '==', storeName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`Store name '${storeName}' not found in storeNames collection`);
      return;
    }
    
    console.log(`Store name '${storeName}' found!`);
    const docData = snapshot.docs[0].data();
    console.log('Store name document data:', docData);
    
    // Check if store exists in stores collection
    const userId = docData.userId;
    if (userId) {
      console.log(`Checking store document with userId: ${userId}`);
      const storeDocRef = doc(db, 'stores', userId);
      const storeDocSnap = await getDoc(storeDocRef);
      
      if (storeDocSnap.exists()) {
        console.log('Store document found!');
        console.log('Store document data:', storeDocSnap.data());
      } else {
        console.log('Store document not found');
        
        // Let's also check if there are any stores in the collection
        console.log('Checking all stores in collection...');
        const storesSnapshot = await getDocs(collection(db, 'stores'));
        console.log(`Total stores found: ${storesSnapshot.size}`);
        storesSnapshot.forEach((doc) => {
          console.log(`Store ID: ${doc.id}, Data:`, doc.data());
        });
        return;
      }
      
      // Check for products
      console.log(`Checking products for store with ownerId: ${userId}`);
      const productsRef = collection(db, 'products');
      const productsQuery = query(productsRef, where('storeId', '==', userId), where('status', '==', 'Active'));
      const productsSnapshot = await getDocs(productsQuery);
      
      console.log(`Found ${productsSnapshot.size} active products`);
      productsSnapshot.forEach((doc) => {
        console.log(`Product ID: ${doc.id}, Data:`, doc.data());
      });
    } else {
      console.log('No userId found in store name document');
    }
  } catch (error) {
    console.error('Error checking store:', error);
  }
}

// Check the lkstore
checkStore('lkstore');