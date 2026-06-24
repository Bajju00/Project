import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../data/local_db.json');

// Ensure data directory and file exist
const ensureDBFile = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({
      users: [],
      hospitals: [],
      ambulances: [],
      bookings: [],
      donors: [],
      bloodstocks: [],
      emergencies: []
    }, null, 2));
  }
};

const readDB = () => {
  ensureDBFile();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return {
      users: [],
      hospitals: [],
      ambulances: [],
      bookings: [],
      donors: [],
      bloodstocks: [],
      emergencies: []
    };
  }
};

const writeDB = (data) => {
  ensureDBFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Simulated mongoose model instance
class MockDocument {
  constructor(collectionName, data) {
    Object.assign(this, data);
    // Ensure id maps to _id
    if (this._id && !this.id) {
      this.id = this._id;
    }
    Object.defineProperty(this, '_collection', { value: collectionName, enumerable: false });
  }

  async save() {
    const db = readDB();
    const collection = db[this._collection] || [];
    const index = collection.findIndex(item => item._id === this._id);

    // Update timestamps
    this.updatedAt = new Date().toISOString();

    // Password hashing if user/hospital password is raw/modified
    if (this.password && (this._collection === 'users' || this._collection === 'hospitals')) {
      // If it doesn't look like a bcrypt hash (starts with $2a$ or $2b$), hash it
      if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }
    }

    const plainData = { ...this };

    if (index !== -1) {
      collection[index] = plainData;
    } else {
      this.createdAt = new Date().toISOString();
      plainData.createdAt = this.createdAt;
      collection.push(plainData);
    }

    db[this._collection] = collection;
    writeDB(db);
    return this;
  }

  async matchPassword(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

// Simulated query class for chaining like .populate() or .sort()
class MockQuery {
  constructor(promise) {
    this.promise = promise;
  }

  then(onfulfilled, onrejected) {
    return this.promise.then(onfulfilled, onrejected);
  }

  catch(onrejected) {
    return this.promise.catch(onrejected);
  }

  select(fields) {
    return this;
  }

  populate(pathName, fields) {
    const nextPromise = this.promise.then(async (data) => {
      if (!data) return data;
      const db = readDB();

      const populateItem = (item) => {
        if (!item) return item;
        const refId = item[pathName];
        if (!refId) return item;

        const refIdStr = (typeof refId === 'object' && refId._id) ? refId._id.toString() : refId.toString();

        // Find in hospitals, users, or ambulances depending on name
        let refObj = null;
        if (pathName === 'hospitalId') {
          refObj = db.hospitals.find(h => h._id === refIdStr);
        } else if (pathName === 'userId') {
          refObj = db.users.find(u => u._id === refIdStr);
        } else if (pathName === 'ambulanceId') {
          refObj = db.ambulances.find(a => a._id === refIdStr);
        }

        if (refObj) {
          const populated = { ...refObj };
          // Exclude password
          delete populated.password;
          return {
            ...item,
            [pathName]: populated
          };
        }
        return item;
      };

      if (Array.isArray(data)) {
        return data.map(populateItem);
      }
      return populateItem(data);
    });

    return new MockQuery(nextPromise);
  }

  sort(sortOptions) {
    const nextPromise = this.promise.then((data) => {
      if (!data || !Array.isArray(data)) return data;

      // Standard sorting by createdAt desc
      if (sortOptions && sortOptions.createdAt === -1) {
        return [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return data;
    });

    return new MockQuery(nextPromise);
  }
}

export const createMockModel = (collectionName) => {
  return {
    find: (query = {}) => {
      const promise = (async () => {
        const db = readDB();
        let list = db[collectionName] || [];

        // Apply simple queries
        Object.entries(query).forEach(([key, val]) => {
          if (val && typeof val === 'object' && val.$ne !== undefined) {
            list = list.filter(item => item[key] !== val.$ne);
          } else if (val !== undefined && typeof val !== 'object') {
            list = list.filter(item => item[key] === val);
          }
        });

        return list.map(item => new MockDocument(collectionName, item));
      })();
      return new MockQuery(promise);
    },

    findOne: (query = {}) => {
      const promise = (async () => {
        const db = readDB();
        const list = db[collectionName] || [];
        
        const found = list.find(item => {
          return Object.entries(query).every(([key, val]) => {
            return item[key] === val;
          });
        });

        return found ? new MockDocument(collectionName, found) : null;
      })();
      return new MockQuery(promise);
    },

    findById: (id) => {
      const promise = (async () => {
        if (!id) return null;
        const db = readDB();
        const list = db[collectionName] || [];
        const found = list.find(item => item._id === id.toString());
        return found ? new MockDocument(collectionName, found) : null;
      })();
      return new MockQuery(promise);
    },

    create: async (data) => {
      const db = readDB();
      const collection = db[collectionName] || [];

      const createItem = async (singleData) => {
        const _id = singleData._id || `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newItem = {
          ...singleData,
          _id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const doc = new MockDocument(collectionName, newItem);
        await doc.save();
        return doc;
      };

      if (Array.isArray(data)) {
        const results = [];
        for (const item of data) {
          results.push(await createItem(item));
        }
        return results;
      }
      return await createItem(data);
    },

    deleteMany: async (query = {}) => {
      const db = readDB();
      // Simple delete all
      if (Object.keys(query).length === 0) {
        db[collectionName] = [];
      } else {
        db[collectionName] = (db[collectionName] || []).filter(item => {
          return !Object.entries(query).every(([key, val]) => item[key] === val);
        });
      }
      writeDB(db);
      return { deletedCount: db[collectionName].length };
    }
  };
};
