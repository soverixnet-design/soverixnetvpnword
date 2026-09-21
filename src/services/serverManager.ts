import { VPNServer } from '../types';
import { SERVERS_DATA } from '../data/servers';
import { db } from '../firebase/config';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

const CUSTOM_SERVERS_LOCAL_KEY = 'soverix_custom_servers_list';
const DELETED_SERVERS_LOCAL_KEY = 'soverix_deleted_servers_list';
const EDITED_SERVERS_LOCAL_KEY = 'soverix_edited_servers_list';

export class ServerManager {
  private static customServers: VPNServer[] = [];
  private static editedServers: Map<string, VPNServer> = new Map();
  private static deletedServerIds: Set<string> = new Set();
  private static listeners: Array<(servers: VPNServer[]) => void> = [];
  private static initialized = false;

  public static init() {
    if (this.initialized) return;
    this.initialized = true;

    // 1. Load from localStorage
    try {
      const savedCustom = localStorage.getItem(CUSTOM_SERVERS_LOCAL_KEY);
      if (savedCustom) {
        this.customServers = JSON.parse(savedCustom);
      }
      const savedEdited = localStorage.getItem(EDITED_SERVERS_LOCAL_KEY);
      if (savedEdited) {
        const parsed: Record<string, VPNServer> = JSON.parse(savedEdited);
        Object.entries(parsed).forEach(([id, s]) => this.editedServers.set(id, s));
      }
      const savedDeleted = localStorage.getItem(DELETED_SERVERS_LOCAL_KEY);
      if (savedDeleted) {
        const parsed: string[] = JSON.parse(savedDeleted);
        parsed.forEach((id) => this.deletedServerIds.add(id));
      }
    } catch (e) {
      console.warn('Failed loading local custom servers:', e);
    }

    // 2. Fetch from Firestore asynchronously
    this.fetchFirestoreData();
  }

  private static async fetchFirestoreData() {
    try {
      const snapshot = await getDocs(collection(db, 'custom_servers'));
      if (!snapshot.empty) {
        const firestoreServers: VPNServer[] = [];
        snapshot.forEach((docSnap) => {
          firestoreServers.push(docSnap.data() as VPNServer);
        });

        const map = new Map<string, VPNServer>();
        this.customServers.forEach((s) => map.set(s.id, s));
        firestoreServers.forEach((s) => map.set(s.id, s));

        this.customServers = Array.from(map.values());
        this.persistLocal();
        this.notifyListeners();
      }
    } catch (err) {
      // Offline fallback ok
    }
  }

  public static getAllServers(): VPNServer[] {
    this.init();
    const map = new Map<string, VPNServer>();

    // 1. Base built-in default servers
    SERVERS_DATA.forEach((s) => {
      if (!this.deletedServerIds.has(s.id)) {
        map.set(s.id, this.editedServers.get(s.id) || { ...s });
      }
    });

    // 2. Custom created servers
    this.customServers.forEach((s) => {
      if (!this.deletedServerIds.has(s.id)) {
        map.set(s.id, this.editedServers.get(s.id) || s);
      }
    });

    return Array.from(map.values());
  }

  public static getCustomServers(): VPNServer[] {
    this.init();
    return this.customServers.filter((s) => !this.deletedServerIds.has(s.id));
  }

  public static async addOrUpdateServer(server: VPNServer): Promise<VPNServer[]> {
    this.init();

    // Check if it's an existing custom server, built-in server, or newly added
    const isBuiltIn = SERVERS_DATA.some((s) => s.id === server.id);

    if (isBuiltIn) {
      this.editedServers.set(server.id, server);
      this.deletedServerIds.delete(server.id);
    } else {
      const existingIndex = this.customServers.findIndex((s) => s.id === server.id);
      if (existingIndex >= 0) {
        this.customServers[existingIndex] = server;
      } else {
        this.customServers = [server, ...this.customServers];
      }
      this.deletedServerIds.delete(server.id);
    }

    this.persistLocal();
    this.notifyListeners();

    // Persist in Firestore
    try {
      const docRef = doc(db, 'custom_servers', server.id);
      await setDoc(docRef, server, { merge: true });
    } catch (e) {
      console.warn('Firestore server sync note (offline/fallback):', e);
    }

    return this.getAllServers();
  }

  public static async deleteServer(serverId: string): Promise<VPNServer[]> {
    this.init();

    // Mark as deleted
    this.deletedServerIds.add(serverId);
    this.customServers = this.customServers.filter((s) => s.id !== serverId);
    this.editedServers.delete(serverId);

    this.persistLocal();
    this.notifyListeners();

    try {
      const docRef = doc(db, 'custom_servers', serverId);
      await deleteDoc(docRef);
    } catch {}

    return this.getAllServers();
  }

  public static async resetToDefaults(): Promise<VPNServer[]> {
    this.init();
    this.deletedServerIds.clear();
    this.editedServers.clear();
    this.customServers = [];
    this.persistLocal();
    this.notifyListeners();
    return this.getAllServers();
  }

  public static subscribe(callback: (servers: VPNServer[]) => void): () => void {
    this.init();
    this.listeners.push(callback);
    callback(this.getAllServers());

    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private static notifyListeners() {
    const all = this.getAllServers();
    this.listeners.forEach((cb) => cb(all));
  }

  private static persistLocal() {
    try {
      localStorage.setItem(CUSTOM_SERVERS_LOCAL_KEY, JSON.stringify(this.customServers));
      localStorage.setItem(DELETED_SERVERS_LOCAL_KEY, JSON.stringify(Array.from(this.deletedServerIds)));
      const editedObj: Record<string, VPNServer> = {};
      this.editedServers.forEach((v, k) => {
        editedObj[k] = v;
      });
      localStorage.setItem(EDITED_SERVERS_LOCAL_KEY, JSON.stringify(editedObj));
    } catch {}
  }
}
