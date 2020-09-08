const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");

const cors = require("cors");
app.use(cors());

const { db } = require("./util/admin");

const {
  getAllHowls,
  postOneHowl,
  getHowl,
  commentOnHowl,
  likeHowl,
  unlikeHowl,
  deleteHowl,
} = require("./handlers/howls");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead,
} = require("./handlers/users");

// Howl routes
app.get("/howls", getAllHowls);
app.post("/howl", FBAuth, postOneHowl);
app.get("/howl/:howlId", getHowl);
app.delete("/howl/:howlId", FBAuth, deleteHowl);
app.get("/howl/:howlId/like", FBAuth, likeHowl);
app.get("/howl/:howlId/unlike", FBAuth, unlikeHowl);
app.post("/howl/:howlId/comment", FBAuth, commentOnHowl);

// users routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user/:handle", getUserDetails);
app.post("/notifications", FBAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/howls/${snapshot.data().howlId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            howlId: doc.id,
          });
        }
      })
      .catch((err) => console.error(err));
  });
exports.deleteNotificationOnUnLike = functions.firestore
  .document("likes/{id}")
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });
exports.createNotificationOnComment = functions.firestore
  .document("comments/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/howls/${snapshot.data().howlId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            howlId: doc.id,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.onUserImageChange = functions.firestore
  .document("/users/{userId}")
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("image has changed");
      const batch = db.batch();
      return db
        .collection("howls")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const howl = db.doc(`/howls/${doc.id}`);
            batch.update(howl, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onHowlDelete = functions.firestore
  .document("/howls/{howlId}")
  .onDelete((snapshot, context) => {
    const howlId = context.params.howlId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("howlId", "==", howlId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db.collection("likes").where("howlId", "==", howlId).get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("howlId", "==", howlId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });
