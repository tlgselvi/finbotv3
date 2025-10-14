/**
 * AST-based File Editor for CTO Koçu v3
 * Safe file editing with snapshot support
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { logger } from './logger.js';

export interface FileSnapshot {
    id: string;
    filePath: string;
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface EditOperation {
    type: 'replace' | 'insert' | 'delete' | 'append';
    line?: number;
    column?: number;
    oldText?: string;
    newText: string;
    context?: string; // Surrounding context for safety
}

export interface EditResult {
    success: boolean;
    snapshotId: string;
    changes: EditOperation[];
    error?: string;
}

class ASTEditor {
    private snapshots: Map<string, FileSnapshot> = new Map();

    /**
     * Create snapshot before editing
     */
    createSnapshot(filePath: string, metadata?: Record<string, any>): string {
        if (!existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const snapshotId = this.generateSnapshotId();
        const content = readFileSync(filePath, 'utf-8');

        const snapshot: FileSnapshot = {
            id: snapshotId,
            filePath,
            content,
            timestamp: new Date(),
            metadata: metadata || {},
        };

        this.snapshots.set(snapshotId, snapshot);
        logger.info(`Snapshot created: ${snapshotId}`, { filePath, size: content.length });

        return snapshotId;
    }

    /**
     * Restore file from snapshot
     */
    restoreSnapshot(snapshotId: string): boolean {
        const snapshot = this.snapshots.get(snapshotId);
        if (!snapshot) {
            logger.error(`Snapshot not found: ${snapshotId}`);
            return false;
        }

        try {
            writeFileSync(snapshot.filePath, snapshot.content, 'utf-8');
            logger.info(`File restored from snapshot: ${snapshotId}`, { filePath: snapshot.filePath });
            return true;
        } catch (error) {
            logger.error(`Failed to restore snapshot: ${snapshotId}`, { error });
            return false;
        }
    }

    /**
     * Edit file with AST-based operations
     */
    editFile(filePath: string, operations: EditOperation[], snapshotId?: string): EditResult {
        try {
            // Create snapshot if not provided
            const snapshot = snapshotId ? this.snapshots.get(snapshotId) : null;
            if (!snapshot) {
                const newSnapshotId = this.createSnapshot(filePath);
                const newSnapshot = this.snapshots.get(newSnapshotId)!;
                return this.editFile(filePath, operations, newSnapshotId);
            }

            let content = snapshot.content;
            const changes: EditOperation[] = [];

            // Apply operations in order
            for (const operation of operations) {
                const result = this.applyOperation(content, operation);
                if (result.success) {
                    content = result.newContent;
                    changes.push(operation);
                } else {
                    throw new Error(`Operation failed: ${result.error}`);
                }
            }

            // Write modified content
            writeFileSync(filePath, content, 'utf-8');

            logger.info(`File edited successfully: ${filePath}`, {
                operations: changes.length,
                snapshotId: snapshot.id
            });

            return {
                success: true,
                snapshotId: snapshot.id,
                changes,
            };
        } catch (error) {
            logger.error(`File edit failed: ${filePath}`, { error });
            return {
                success: false,
                snapshotId: snapshotId || '',
                changes: [],
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Apply single operation to content
     */
    private applyOperation(content: string, operation: EditOperation): { success: boolean; newContent: string; error?: string } {
        try {
            const lines = content.split('\n');

            switch (operation.type) {
                case 'replace':
                    return this.applyReplace(lines, operation);
                case 'insert':
                    return this.applyInsert(lines, operation);
                case 'delete':
                    return this.applyDelete(lines, operation);
                case 'append':
                    return this.applyAppend(lines, operation);
                default:
                    return { success: false, newContent: content, error: 'Unknown operation type' };
            }
        } catch (error) {
            return {
                success: false,
                newContent: content,
                error: error instanceof Error ? error.message : 'Operation failed'
            };
        }
    }

    /**
     * Apply replace operation
     */
    private applyReplace(lines: string[], operation: EditOperation): { success: boolean; newContent: string; error?: string } {
        if (!operation.oldText || !operation.newText) {
            return { success: false, newContent: lines.join('\n'), error: 'Replace operation requires oldText and newText' };
        }

        // Find and replace text
        const content = lines.join('\n');
        if (!content.includes(operation.oldText)) {
            return { success: false, newContent: content, error: 'Text to replace not found' };
        }

        const newContent = content.replace(operation.oldText, operation.newText);
        return { success: true, newContent };
    }

    /**
     * Apply insert operation
     */
    private applyInsert(lines: string[], operation: EditOperation): { success: boolean; newContent: string; error?: string } {
        if (operation.line === undefined) {
            return { success: false, newContent: lines.join('\n'), error: 'Insert operation requires line number' };
        }

        if (operation.line < 0 || operation.line > lines.length) {
            return { success: false, newContent: lines.join('\n'), error: 'Invalid line number' };
        }

        // Insert at specified line
        lines.splice(operation.line, 0, operation.newText);
        return { success: true, newContent: lines.join('\n') };
    }

    /**
     * Apply delete operation
     */
    private applyDelete(lines: string[], operation: EditOperation): { success: boolean; newContent: string; error?: string } {
        if (operation.line === undefined) {
            return { success: false, newContent: lines.join('\n'), error: 'Delete operation requires line number' };
        }

        if (operation.line < 0 || operation.line >= lines.length) {
            return { success: false, newContent: lines.join('\n'), error: 'Invalid line number' };
        }

        // Delete specified line
        lines.splice(operation.line, 1);
        return { success: true, newContent: lines.join('\n') };
    }

    /**
     * Apply append operation
     */
    private applyAppend(lines: string[], operation: EditOperation): { success: boolean; newContent: string; error?: string } {
        // Append to end of file
        lines.push(operation.newText);
        return { success: true, newContent: lines.join('\n') };
    }

    /**
     * Get snapshot information
     */
    getSnapshot(snapshotId: string): FileSnapshot | null {
        return this.snapshots.get(snapshotId) || null;
    }

    /**
     * List all snapshots
     */
    listSnapshots(): FileSnapshot[] {
        return Array.from(this.snapshots.values());
    }

    /**
     * Delete snapshot
     */
    deleteSnapshot(snapshotId: string): boolean {
        const deleted = this.snapshots.delete(snapshotId);
        if (deleted) {
            logger.info(`Snapshot deleted: ${snapshotId}`);
        }
        return deleted;
    }

    /**
     * Generate unique snapshot ID
     */
    private generateSnapshotId(): string {
        return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Parse and validate edit operations
     */
    validateOperations(operations: EditOperation[]): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        for (let i = 0; i < operations.length; i++) {
            const op = operations[i];

            if (!op.type) {
                errors.push(`Operation ${i}: Missing type`);
                continue;
            }

            switch (op.type) {
                case 'replace':
                    if (!op.oldText || !op.newText) {
                        errors.push(`Operation ${i}: Replace requires oldText and newText`);
                    }
                    break;
                case 'insert':
                    if (op.line === undefined) {
                        errors.push(`Operation ${i}: Insert requires line number`);
                    }
                    if (!op.newText) {
                        errors.push(`Operation ${i}: Insert requires newText`);
                    }
                    break;
                case 'delete':
                    if (op.line === undefined) {
                        errors.push(`Operation ${i}: Delete requires line number`);
                    }
                    break;
                case 'append':
                    if (!op.newText) {
                        errors.push(`Operation ${i}: Append requires newText`);
                    }
                    break;
                default:
                    errors.push(`Operation ${i}: Unknown operation type: ${op.type}`);
            }
        }

        return { valid: errors.length === 0, errors };
    }
}

// Singleton instance
export const astEditor = new ASTEditor();

// Utility functions for common operations
export function createFileSnapshot(filePath: string): string {
    return astEditor.createSnapshot(filePath);
}

export function restoreFileSnapshot(snapshotId: string): boolean {
    return astEditor.restoreSnapshot(snapshotId);
}

export function editFileWithSnapshot(filePath: string, operations: EditOperation[]): EditResult {
    const snapshotId = createFileSnapshot(filePath);
    return astEditor.editFile(filePath, operations, snapshotId);
}

export function replaceInFile(filePath: string, oldText: string, newText: string): EditResult {
    return editFileWithSnapshot(filePath, [{
        type: 'replace',
        oldText,
        newText,
    }]);
}

export function insertAtLine(filePath: string, line: number, text: string): EditResult {
    return editFileWithSnapshot(filePath, [{
        type: 'insert',
        line,
        newText: text,
    }]);
}

export function appendToFile(filePath: string, text: string): EditResult {
    return editFileWithSnapshot(filePath, [{
        type: 'append',
        newText: text,
    }]);
}
