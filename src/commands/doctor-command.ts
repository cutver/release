import * as core from '@actions/core';
import { BaseCommand } from './base-command';
import type { DoctorOptions } from '../types/options';
import type { CutverRunner } from '../runner/cutver-runner';

export class DoctorCommand extends BaseCommand<void> {
    constructor(runner: CutverRunner, private readonly options: DoctorOptions) {
        super(runner);
    }

    async execute(): Promise<void> {
        core.info('Ejecutando diagnóstico de integridad...');
        const args = ['doctor'];

        if (this.options.checkChangelog) {
            args.push('--check-changelog');
        }

        const output = await this.runner.run(args);
        if (output) {
            core.info(output);
        }
        core.info('cutver doctor: sin anomalías.');
    }
}