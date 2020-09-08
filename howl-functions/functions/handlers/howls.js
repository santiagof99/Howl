const { db } = require("../util/admin");

exports.getAllHowls = (req, res) => {
  db.collection("howls")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let howls = [];
      data.forEach((doc) => {
        howls.push({
          howlId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          userImage: doc.data().userImage,
        });
      });
      return res.json(howls);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.postOneHowl = (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({ body: "Body must not be empty" });
  }

  const newHowl = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };

  db.collection("howls")
    .add(newHowl)
    .then((doc) => {
      const resHowl = newHowl;
      resHowl.howlId = doc.id;
      res.json(resHowl);
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};

exports.getHowl = (req, res) => {
  let howlData = {};
  db.doc(`/howls/${req.params.howlId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "howl not found" });
      }
      howlData = doc.data();
      howlData.howlId = doc.id;
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("howlId", "==", req.params.howlId)
        .get();
    })
    .then((data) => {
      howlData.comments = [];
      data.forEach((doc) => {
        howlData.comments.push(doc.data());
      });
      return res.json(howlData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
// Comment on a comment
exports.commentOnHowl = (req, res) => {
  if (req.body.body.trim() === "")
    return res.status(400).json({ comment: "Must not be empty" });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    howlId: req.params.howlId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
  };
  console.log(newComment);

  db.doc(`/howls/${req.params.howlId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "howl not found" });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Something went wrong" });
    });
};
// Like a howl
exports.likeHowl = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("howlId", "==", req.params.howlId)
    .limit(1);

  const howlDocument = db.doc(`/howls/${req.params.howlId}`);

  let howlData;

  howlDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        howlData = doc.data();
        howlData.howlId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "howl not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            howlId: req.params.howlId,
            userHandle: req.user.handle,
          })
          .then(() => {
            howlData.likeCount++;
            return howlDocument.update({ likeCount: howlData.likeCount });
          })
          .then(() => {
            return res.json(howlData);
          });
      } else {
        return res.status(400).json({ error: "howl already liked" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.unlikeHowl = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("howlId", "==", req.params.howlId)
    .limit(1);

  const howlDocument = db.doc(`/howls/${req.params.howlId}`);

  let howlData;

  howlDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        howlData = doc.data();
        howlData.howlId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "howl not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: "howl not liked" });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            howlData.likeCount--;
            return howlDocument.update({ likeCount: howlData.likeCount });
          })
          .then(() => {
            res.json(howlData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
// Delete a howl
exports.deleteHowl = (req, res) => {
  const document = db.doc(`/howls/${req.params.howlId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "howl not found" });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: "Unauthorized" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: "howl deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
