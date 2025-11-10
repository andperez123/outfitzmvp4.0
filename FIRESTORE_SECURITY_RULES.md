# Firestore Security Rules for Outfitz v5.0

This document contains the Firestore security rules that need to be configured in your Firebase Console for the Profile feature.

## Security Rules for /users/{uid}

Users should be able to read and write only their own profile data.

### Rules Configuration

Go to Firebase Console → Firestore Database → Rules and add the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Saved outfits collection - users can read/write their own outfits
    match /savedOutfits/{outfitId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Curated collections - PUBLIC READ (anyone can view), write requires admin
    match /curated_collections/{collectionId} {
      allow read: if true; // Public read access - curated content is public
      allow write: if false; // Only admins can write (handled via backend/admin)
      
      // Outfits within collections - PUBLIC READ
      match /outfits/{outfitId} {
        allow read: if true; // Public read access
        allow write: if false; // Only admins can write
      }
    }
    
    // New top-level outfits collection - PUBLIC READ
    match /outfits/{outfitId} {
      allow read: if true; // Public read access - curated content is public
      allow write: if false; // Only admins can write (handled via backend/admin)
    }
    
    // User sessions - users can create their own sessions
    match /user_sessions/{sessionId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if false; // Sessions are immutable once created
    }
    
    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Field-Level Validation (Optional but Recommended)

For enhanced security, you can add field validation. Here's an extended version with validation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to validate user profile data
    function isValidProfileData() {
      let data = request.resource.data;
      return data.keys().hasAll(['updatedAt']) &&
             data.gender is string &&
             data.presentation is string &&
             data.bodyType is string &&
             data.ethnicity is string &&
             data.height is string &&
             data.hairType is string &&
             data.sizes is map &&
             data.fitPreferences is map &&
             data.styleTags is list &&
             data.colors is list &&
             data.budget is string &&
             data.location is string;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && 
                       request.auth.uid == userId && 
                       isValidProfileData();
      allow update: if request.auth != null && 
                       request.auth.uid == userId && 
                       isValidProfileData();
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Saved outfits collection
    match /savedOutfits/{outfitId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Curated collections - PUBLIC READ (anyone can view)
    match /curated_collections/{collectionId} {
      allow read: if true; // Public read access - curated content is public
      allow write: if false; // Admin-only (use Firebase Admin SDK)
      
      match /outfits/{outfitId} {
        allow read: if true; // Public read access
        allow write: if false; // Admin-only
      }
    }
    
    // New top-level outfits collection - PUBLIC READ
    match /outfits/{outfitId} {
      allow read: if true; // Public read access - curated content is public
      allow write: if false; // Only admins can write (handled via backend/admin)
    }
    
    // User sessions - users can create their own sessions
    match /user_sessions/{sessionId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      allow update, delete: if false; // Sessions are immutable
    }
  }
}
```

## How to Apply These Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy and paste the rules above
5. Click **Publish** to apply the rules

## Testing the Rules

After applying the rules, test them by:

1. **Read Test**: Try to access another user's profile (should fail)
2. **Write Test**: Try to update your own profile (should succeed)
3. **Unauthenticated Test**: Try to access profiles without authentication (should fail)

## Important Notes

- **Curated Collections & Outfits**: Public read access (no authentication required) - these are public content
- **User Profiles**: Users can only access their own profile data (authentication required)
- **Saved Outfits**: Users can only access their own saved outfits (authentication required)
- **User Sessions**: Users can only create/read their own sessions (authentication required)
- All write operations on curated content require admin access (via Firebase Admin SDK)
- Always test rules in the Firebase Console Rules Playground before deploying

## Security Best Practices

1. **Always validate on both client and server**: These rules are a server-side security layer, but client-side validation is also important
2. **Regular audits**: Review access patterns in Firebase Console
3. **Monitor**: Use Firebase Monitoring to track rule violations
4. **Updates**: Keep rules updated as your data model evolves

