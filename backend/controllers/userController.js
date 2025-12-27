const crypto = require('crypto');
const User = require('../models/User');
const AllowedEmail = require('../models/AllowedEmail');
const OrgCreatorAllow = require('../models/orgCreatorAllow');

function normalizeEmail(email) {
  if (!email) return null;
  return String(email).toLowerCase().trim();
}

function newOrgId() {
  return 'org_' + crypto.randomBytes(5).toString('hex');
}

async function getCurrentUser(req, res) {
  const googleId = req.user?.googleId;
  if (!googleId) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  const me = await User.findOne({ googleId });
  if (!me) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return me;
}

function ensureOwner(res, me) {
  if (me.role !== 'owner') {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
}


exports.login = async (req, res) => {
  const { googleId, name, email } = req.body || {};
  if (!googleId) return res.status(400).json({ error: 'googleId required' });

  try {
    let user = await User.findOne({ googleId });


    if (user) {
      let changed = false;
      if (name && name !== user.name) { user.name = name; changed = true; }
      if (email && email !== user.email) { user.email = email; changed = true; }
      if (changed) await user.save();

      if (user.role !== 'owner') {
        const allowed = await AllowedEmail.findOne({
          orgId: user.orgId,
          email: normalizeEmail(user.email),
        });
        if (!allowed) {
          return res.status(403).json({ error: 'Access blocked: email not on allowlist' });
        }

        const allowedRoles = new Set(['owner', 'admin', 'user']);
        const r = allowedRoles.has(allowed.role) ? allowed.role : 'user';

        if (user.role !== r) {
          user.role = r;
          await user.save();
        }
      }

      return res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
    }

    const someOwner = await User.findOne({ role: 'owner' });
    if (someOwner) {
      const allowed = await AllowedEmail.findOne({
        orgId: someOwner.orgId,
        email: normalizeEmail(email),
      });

      if (allowed) {
        const allowedRoles = new Set(['owner', 'admin', 'user']);
        const role = allowedRoles.has(allowed.role) ? allowed.role : 'user';

        user = await User.create({
          googleId, name, email,
          orgId: someOwner.orgId,
          role,
        });

        return res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
      }
    }

    const canOpen = await OrgCreatorAllow.findOne({ email: normalizeEmail(email) });
    if (canOpen) {
      const orgId = newOrgId();
      user = await User.create({ googleId, name, email, orgId, role: 'owner' });

      await AllowedEmail.findOneAndUpdate(
        { orgId, email: normalizeEmail(user.email) },
        { $set: { role: 'owner' } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
    }

    return res.status(403).json({ error: 'Not authorized' });
  } catch (error) {
    console.error('error logging in', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllowlist = async (req, res) => {
  try {
    const me = await getCurrentUser(req, res);
    if (!me) return;
    if (!ensureOwner(res, me)) return;

    const rows = await AllowedEmail.find({ orgId: me.orgId }).sort({ createdAt: -1 });
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'failed to fetch allowlist' });
  }
};

exports.addToAllowlist = async (req, res) => {
  try {
    const me = await getCurrentUser(req, res);
    if (!me) return;
    if (!ensureOwner(res, me)) return;

    const { email, role = 'user' } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email required' });

    const row = await AllowedEmail.findOneAndUpdate(
      { orgId: me.orgId, email: normalizeEmail(email) },
      { $set: { role } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(row);
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ error: 'already exists' });
    res.status(500).json({ error: 'failed to add to allowlist' });
  }
};

exports.deleteFromAllowlist = async (req, res) => {
  try {
    const me = await getCurrentUser(req, res);
    if (!me) return;
    if (!ensureOwner(res, me)) return;

    const row = await AllowedEmail.findById(req.params.id);
    if (!row || row.orgId !== me.orgId) return res.status(404).json({ error: 'Not found' });

    await row.deleteOne();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'failed to delete' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const me = await getCurrentUser(req, res);
    if (!me) return;
    if (!ensureOwner(res, me)) return;

    const users = await User.find({ orgId: me.orgId }).sort({ createdAt: -1 });
    res.json(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })));
  } catch {
    res.status(500).json({ error: 'failed to fetch users' });
  }
};
