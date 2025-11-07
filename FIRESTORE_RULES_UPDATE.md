# Firestore Rules Update Instructions

## Problem
The School Dashboard shows "Error loading students - Missing or insufficient permissions" because the current Firestore security rules don't allow schools to query their students.

## Solution
The `firestore.rules` file has been updated to add an `isSchool()` function and grant schools read/update permissions for their students.

## How to Deploy the Updated Rules

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **aluminiconnect-271dd**
3. Click on **Firestore Database** in the left menu
4. Click on the **Rules** tab
5. Copy the contents of `firestore.rules` from this project
6. Paste it into the Firebase Console rules editor
7. Click **Publish**

### Option 2: Firebase CLI (If you have permissions)
```bash
firebase login
firebase deploy --only firestore:rules
```

### Option 3: Using Firebase Admin SDK (Local Testing)
If you're using the Firebase Emulator for local development:
```bash
firebase emulators:start
```

## What Changed

### Added `isSchool()` function:
```javascript
function isSchool() {
  return isSignedIn() && 
    (request.auth.uid == resource.data.schoolId || 
     request.auth.uid == resource.data.authUid);
}
```

### Updated permissions:
- **Read**: Added `isSchool()` to allow schools to read their students
- **Update**: Added `isSchool()` to allow schools to update their students

### Before:
```javascript
allow read: if resource.data.isPublic == true || isOwner() || isCollege() || isAdmin();
allow update: if isOwner() || isCollege() || isAdmin() || canInitialLink();
```

### After:
```javascript
allow read: if resource.data.isPublic == true || isOwner() || isSchool() || isCollege() || isAdmin();
allow update: if isOwner() || isSchool() || isCollege() || isAdmin() || canInitialLink();
```

## Verification
After deploying, refresh the School Dashboard and the students should load successfully.
