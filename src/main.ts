import * as core from '@actions/core';
import { CutverRunner } from './runner/cutver-runner';
import { ReleaseOrchestrator } from './services/orchestrator';
import type { ActionInputs, ActionCommand, BumpLevel } from './types/options';

async function run(): Promise<void> {
    try {
        const rawSkip = core.getInput('skip-preflight');
        const skipSteps = rawSkip ? rawSkip.split(',').map((s) => s.trim()) : undefined;

        const inputs: ActionInputs = {
            command: (core.getInput('command') || 'release') as ActionCommand,
            bump: (core.getInput('bump') || 'auto') as BumpLevel,
            config: core.getInput('config') || undefined,
            dryRun: core.getBooleanInput('dry-run'),
            skipPreflight: skipSteps,
            checkChangelog: core.getBooleanInput('check-changelog'),
            notesFile: core.getInput('notes-file') || 'RELEASE_NOTES.md',
            template: core.getInput('template') || undefined,
            firstRelease: core.getBooleanInput('first-release')
        };

        const runner = new CutverRunner(inputs.config);
        const orchestrator = new ReleaseOrchestrator(runner);

        const result = await orchestrator.execute(inputs);

        core.setOutput('released', String(result.released));
        if (result.version) core.setOutput('version', result.version);
        if (result.tag) core.setOutput('tag', result.tag);
        if (result.notesPath) core.setOutput('notes-path', result.notesPath);
        if (result.releaseNotes) core.setOutput('release-notes', result.releaseNotes);

        core.info('Ejecución de cutver action finalizada.');
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

run();