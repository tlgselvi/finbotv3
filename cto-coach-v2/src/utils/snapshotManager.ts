// Snapshot Manager - State yönetimi ve rollback özellikleri
export interface Snapshot {
  id: string;
  timestamp: Date;
  state: any;
  description?: string;
}

class SnapshotManager {
  private snapshots: Map<string, Snapshot> = new Map();
  private maxSnapshots = 10;

  createSnapshot(state: any, description?: string): string {
    const id = `snap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const snapshot: Snapshot = {
      id,
      timestamp: new Date(),
      state: JSON.parse(JSON.stringify(state)), // Deep clone
      description
    };
    
    this.snapshots.set(id, snapshot);
    
    // Eski snapshot'ları temizle
    if (this.snapshots.size > this.maxSnapshots) {
      const oldest = Array.from(this.snapshots.values())
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];
      this.snapshots.delete(oldest.id);
    }
    
    return id;
  }

  restoreSnapshot(snapshotId: string): any {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }
    return snapshot.state;
  }

  getSnapshot(snapshotId: string): Snapshot | undefined {
    return this.snapshots.get(snapshotId);
  }

  listSnapshots(): Snapshot[] {
    return Array.from(this.snapshots.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  deleteSnapshot(snapshotId: string): boolean {
    return this.snapshots.delete(snapshotId);
  }

  clearSnapshots(): void {
    this.snapshots.clear();
  }
}

export const snapshotManager = new SnapshotManager();
