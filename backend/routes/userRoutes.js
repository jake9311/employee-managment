const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.post('/login', userController.login);

router.get('/allowlist', userController.getAllowlist);
router.post('/allowlist', userController.addToAllowlist);
router.delete('/allowlist/:id', userController.deleteFromAllowlist);

router.get('/list', userController.listUsers);

module.exports = router;















// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const AllowedEmail = require('../models/AllowedEmail');
// const orgCreatorAllow = require('../models/orgCreatorAllow');


// async function getCurrentUser(req,res){
//   const googleId = req.user?.googleId;
//   if(!googleId){
//     res.status(401).json({error: 'Unauthorized'});
//     return null;
//   }
//   const me = await User.findOne({ googleId});
//   if(!me){
//     res.status(401).json({error: 'Unauthorized'});
//     return null;
//   }
//   return me;

// }

// function newOrgId() {
//   return 'org_' + crypto.randomBytes(5).toString('hex');
// }


// function ensureOwner(res, me){
//   if (me.role !== 'owner') {
//     res.status(403).json({ error: 'Forbidden' });
//     return false;
//   }
//   return true;
// }


// normalizeEmail = (email) => {
//   if (!email) return null;
//   return String(email).toLowerCase().trim();
// }

// router.get('/ping',(_req, res) => res.send('users route ok'));

// router.post('/login', async (req, res) => {
//   const { googleId, name, email } = req.body || {};
//   if (!googleId) return res.status(400).json({ error: 'googleId required' });

//   try {
//     let user = await User.findOne({ googleId });
//   if (user){
//     let changed = false;
//     if (name && name !== user.name)  { user.name = name;   changed = true; }
//     if (email && email !== user.email) { user.email = email; changed = true; }
//     if (changed) await user.save();
  

//    if (user.role !== 'owner') {
//     const allowd = await AllowedEmail.findOne({
//       orgId: user.orgId,
//       email: normalizeEmail(user.email),
//     });
//     if (!allowd) {
//       return res.status(403).json({ error: 'Access blocked: email not on allowlist' });
//     }
//     const allowdRoles = new Set(['owner', 'admin', 'user']);
//     const r= allowdRoles.has(allowd.role) ? allowd.role : 'user';
//     if (user.role !== r) {
//       user.role = r;
//       await user.save();
//     }
//    }
//    return res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
// }
//  const someOwner = await User.findOne({ role: 'owner' }); // אופציונלי: למצוא owner קיים
//     if (someOwner) {
//       // לבדוק האם המייל הזה מורשה בארגון קיים (אם יש מדיניות כזו)
//       const allowed = await AllowedEmail.findOne({
//         orgId: someOwner.orgId,
//         email: normalizeEmail(email),
//       });
//       if (allowed) {
//         // המשתמש נכנס כמשתמש בארגון של ה-owner הראשון (או לפי לוגיקה שלך)
//         const allowedRoles = new Set(['owner','admin','user']);
//         const role = allowedRoles.has(allowed.role) ? allowed.role : 'user';

//         user = await User.create({
//           googleId, name, email,
//           orgId: someOwner.orgId,
//           role,
//         });

//         return res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
//       }
//     }
  

// const canOpen = await orgCreatorAllow.findOne({email: normalizeEmail(user.email)});
// if (canOpen){
//   const orgId = newOrgId();
//   user = await User.create({ googleId, name, email, orgId, role: 'owner' });

// await AllowedEmail.findOneAndUpdate(
//   {orgId, email: normalizeEmail(user.email)},
//   { $set: {role: 'owner'}},
//   {upsert: true, new: true, setDefaultsOnInsert: true}
//   );

//   return res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
// }
// return res.status(403).json({ error: 'Not authorized' });
//   } catch (error) {
//     console.error('error logging in', error);
//     res.status(500).json({ error: error.message });
//   }
// });
  




// router.get('/allowlist', async (req, res) => {
//   try {
//     const me = await getCurrentUser(req, res);
//     if (!me) return;
//     if (!ensureOwner(res, me)) return;

//     const orgId = me.orgId || me.googleId;
//     const rows = await AllowedEmail.find({ orgId }).sort({ createdAt: -1 });
//     res.json(rows);
//   } catch (e) {
//     res.status(500).json({ error: 'failed to fetch allowlist' });
//   }
// });


// router.post('/allowlist', async (req, res) => {
//   try {
//     const me = await getCurrentUser(req, res);
//     if (!me) return;
//     if (!ensureOwner(res, me)) return;

//     const { email, role = 'viewer' } = req.body || {};
//     if (!email) return res.status(400).json({ error: 'email required' });

//     const orgId = me.orgId || me.googleId;
//     const row = await AllowedEmail.findOneAndUpdate(
//       { orgId, email: normalizeEmail(email) },
//       { $set: { role } },
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     );
//     res.status(201).json(row);
//   } catch (e) {
//     if (e?.code === 11000) return res.status(409).json({ error: 'already exists' });
//     res.status(500).json({ error: 'failed to add to allowlist' });
//   }
// });

// //**
// // delete from aloow list
// //  */
// router.delete('/allowlist/:id', async (req, res) => {
//   try {
//     const me = await getCurrentUser(req, res);
//     if (!me) return;
//     if (!ensureOwner(res, me)) return;

//     const orgId = me.orgId || me.googleId;
//     const row = await AllowedEmail.findById(req.params.id);
//     if (!row || row.orgId !== orgId) return res.status(404).json({ error: 'Not found' });

//     await row.deleteOne();
//     res.json({ ok: true });
//   } catch (e) {
//     res.status(500).json({ error: 'failed to delete' });
//   }
// });

// router.get('/list', async (req, res) => {
//   try {
//     const me = await getCurrentUser(req, res);
//     if (!me) return;
//     if (!ensureOwner(res, me)) return;

//     const orgId = me.orgId || me.googleId;
//     const users = await User.find({ orgId }).sort({ createdAt: -1 });
//     res.json(users.map(u => ({
//       id: u._id, name: u.name, email: u.email, role: u.role
//     })));
//   } catch (e) {
//     res.status(500).json({ error: 'failed to fetch users' });
//   }
// });

// module.exports = router;
















