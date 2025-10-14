/**
 * Job Queue System for CTO Koçu v3
 * Async task processing with worker system
 */
import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
class JobQueue extends EventEmitter {
    jobs = new Map();
    workers = new Map();
    runningJobs = new Set();
    isProcessing = false;
    /**
     * Add job to queue
     */
    async addJob(type, payload, options = {}) {
        const jobId = this.generateJobId();
        const job = {
            id: jobId,
            type,
            payload,
            status: 'pending',
            priority: options.priority || 0,
            createdAt: new Date(),
            retryCount: 0,
            maxRetries: options.maxRetries || 3,
            metadata: options.metadata || {},
        };
        this.jobs.set(jobId, job);
        logger.info(`Job added to queue: ${jobId} - type: ${type}, priority: ${job.priority}`);
        // Start processing if not already running
        if (!this.isProcessing) {
            this.processQueue();
        }
        return jobId;
    }
    /**
     * Register worker
     */
    registerWorker(name, processor, config) {
        const worker = new Worker(name, processor, config, this);
        this.workers.set(name, worker);
        logger.info(`Worker registered: ${name} - concurrency: ${config.concurrency}`);
    }
    /**
     * Get job status
     */
    getJobStatus(jobId) {
        return this.jobs.get(jobId) || null;
    }
    /**
     * Cancel job
     */
    async cancelJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job)
            return false;
        if (job.status === 'running') {
            // Signal worker to stop
            this.emit('cancelJob', jobId);
        }
        job.status = 'cancelled';
        job.completedAt = new Date();
        this.jobs.set(jobId, job);
        logger.info(`Job cancelled: ${jobId}`);
        return true;
    }
    /**
     * Get queue statistics
     */
    getQueueStats() {
        const stats = {
            total: 0,
            pending: 0,
            running: 0,
            completed: 0,
            failed: 0,
            cancelled: 0,
        };
        for (const job of this.jobs.values()) {
            stats.total++;
            stats[job.status]++;
        }
        return stats;
    }
    /**
     * Process queue
     */
    async processQueue() {
        if (this.isProcessing)
            return;
        this.isProcessing = true;
        try {
            while (true) {
                const pendingJobs = Array.from(this.jobs.values())
                    .filter(job => job.status === 'pending')
                    .sort((a, b) => b.priority - a.priority);
                if (pendingJobs.length === 0)
                    break;
                for (const job of pendingJobs) {
                    const worker = this.findAvailableWorker(job.type);
                    if (worker) {
                        await this.assignJobToWorker(job, worker);
                    }
                }
                // Wait a bit before checking again
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        finally {
            this.isProcessing = false;
        }
    }
    /**
     * Find available worker for job type
     */
    findAvailableWorker(jobType) {
        for (const worker of this.workers.values()) {
            if (worker.canHandleJob(jobType) && worker.hasCapacity()) {
                return worker;
            }
        }
        return null;
    }
    /**
     * Assign job to worker
     */
    async assignJobToWorker(job, worker) {
        job.status = 'running';
        job.startedAt = new Date();
        this.runningJobs.add(job.id);
        this.jobs.set(job.id, job);
        try {
            await worker.processJob(job);
        }
        catch (error) {
            logger.error(`Job processing failed: ${job.id} - ${error}`);
        }
    }
    /**
     * Update job status
     */
    updateJobStatus(jobId, status, result, error) {
        const job = this.jobs.get(jobId);
        if (!job)
            return;
        job.status = status;
        job.completedAt = new Date();
        if (result)
            job.result = result;
        if (error)
            job.error = error;
        this.jobs.set(jobId, job);
        if (status === 'completed' || status === 'failed' || status === 'cancelled') {
            this.runningJobs.delete(jobId);
        }
        logger.info(`Job status updated: ${jobId} - status: ${status}, hasResult: ${!!result}, hasError: ${!!error}`);
    }
    /**
     * Generate unique job ID
     */
    generateJobId() {
        return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
class Worker {
    name;
    processor;
    config;
    queue;
    runningJobs = new Set();
    isCancelled = false;
    constructor(name, processor, config, queue) {
        this.name = name;
        this.processor = processor;
        this.config = config;
        this.queue = queue;
        // Listen for cancellation signals
        this.queue.on('cancelJob', (jobId) => {
            if (this.runningJobs.has(jobId)) {
                this.isCancelled = true;
            }
        });
    }
    /**
     * Check if worker can handle job type
     */
    canHandleJob(jobType) {
        // For now, all workers can handle all job types
        // This can be extended with specific type matching
        return true;
    }
    /**
     * Check if worker has capacity
     */
    hasCapacity() {
        return this.runningJobs.size < this.config.concurrency;
    }
    /**
     * Process job
     */
    async processJob(job) {
        this.runningJobs.add(job.id);
        this.isCancelled = false;
        try {
            logger.info(`Worker ${this.name} processing job: ${job.id}`);
            // Set timeout
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Job timeout')), this.config.timeout));
            // Process job
            const result = await Promise.race([
                this.processor(job),
                timeoutPromise,
            ]);
            if (this.isCancelled) {
                this.queue.updateJobStatus(job.id, 'cancelled');
            }
            else {
                this.queue.updateJobStatus(job.id, 'completed', result);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (job.retryCount < job.maxRetries && !this.isCancelled) {
                // Retry job
                job.retryCount++;
                job.status = 'pending';
                job.startedAt = undefined;
                this.queue.updateJobStatus(job.id, 'pending');
                logger.info(`Job retry scheduled: ${job.id} - retryCount: ${job.retryCount}`);
                // Delay before retry
                setTimeout(() => {
                    this.queue.emit('retryJob', job);
                }, this.config.retryDelay);
            }
            else {
                this.queue.updateJobStatus(job.id, 'failed', undefined, errorMessage);
            }
        }
        finally {
            this.runningJobs.delete(job.id);
        }
    }
}
// Singleton instance
export const jobQueue = new JobQueue();
// Built-in job processors
export const auditJobProcessor = async (job) => {
    logger.info(`Processing audit job: ${job.id}`);
    // Simulate audit process
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
        auditResults: {
            vulnerabilities: 3,
            issues: 12,
            recommendations: 8,
        },
        duration: 2000,
    };
};
export const optimizeJobProcessor = async (job) => {
    logger.info(`Processing optimize job: ${job.id}`);
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
        optimizations: {
            bundleSize: '1.2MB',
            loadTime: '1.5s',
            performance: '85%',
        },
        duration: 3000,
    };
};
// Register built-in workers
jobQueue.registerWorker('audit-worker', auditJobProcessor, {
    name: 'audit-worker',
    concurrency: 2,
    timeout: 60000, // 1 minute
    retryDelay: 5000, // 5 seconds
});
jobQueue.registerWorker('optimize-worker', optimizeJobProcessor, {
    name: 'optimize-worker',
    concurrency: 1,
    timeout: 120000, // 2 minutes
    retryDelay: 10000, // 10 seconds
});
