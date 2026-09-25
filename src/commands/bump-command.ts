import * as core from '@actions/core';
import { BaseCommand } from './base-command';
import type { BumpOptions } from '../types/options';
import type { CutverRunner } from '../runner/cutver-runner';

export class BumpCommand extends BaseCommand<void> {
    constructor(runner: CutverRunner, private readonly options: BumpOptions) {
        super(runner);
    }

    async execute(): Promise<void> {
        const args = ['bump', this.options.level];

        if (this.options.dryRun) {
            args.push('--dry-run');
        }

        if (this.options.skipPreflight) {
            for (const step of this.options.skipPreflight) {
                if (step.trim()) {
                    args.push('--skip-preflight', step.trim());
                }
            }
        }

        core.info(`Ejecutando: cutver ${args.join(' ')}`);
        const output = await this.runner.run(args);
        if (output) {
            core.info(output);
        }
        core.info(`Bump ${this.options.level} finalizado.`);
    }
}