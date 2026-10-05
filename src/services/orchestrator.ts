import * as exec from '@actions/exec';
import type { CutverRunner } from '../runner/cutver-runner';
import type { ActionInputs } from '../types/options';
import { DoctorCommand } from '../commands/doctor-command';
import { BumpCommand } from '../commands/bump-command';
import { ChangelogCommand } from '../commands/changelog-command';

export interface OrchestrationResult {
    released: boolean;
    version?: string;
    tag?: string;
    notesPath?: string;
    releaseNotes?: string;
}

export class ReleaseOrchestrator {
    constructor(private readonly runner: CutverRunner) { }

    async execute(inputs: ActionInputs): Promise<OrchestrationResult> {
        let preSha = '';
        try {
            preSha = (await exec.getExecOutput('git', ['rev-parse', 'HEAD'])).stdout.trim();
        } catch {
            // Not in a git repo or no commits yet
        }

        if (inputs.command === 'doctor' || inputs.command === 'release') {
            const doctor = new DoctorCommand(this.runner, {
                config: inputs.config,
                checkChangelog: inputs.checkChangelog
            });
            await doctor.execute();
            if (inputs.command === 'doctor') {
                return { released: false };
            }
        }

        if (inputs.command === 'bump' || inputs.command === 'release') {
            const bump = new BumpCommand(this.runner, {
                config: inputs.config,
                level: inputs.bump,
                dryRun: inputs.dryRun,
                skipPreflight: inputs.skipPreflight,
                firstRelease: inputs.firstRelease
            });
            await bump.execute();
        }

        let released = false;
        let tag = '';
        let version = '';

        if (inputs.command === 'bump' || inputs.command === 'release') {
            let postSha = '';
            try {
                postSha = (await exec.getExecOutput('git', ['rev-parse', 'HEAD'])).stdout.trim();
            } catch {}

            if (preSha && postSha && preSha !== postSha) {
                released = true;
                try {
                    tag = (await exec.getExecOutput('git', ['describe', '--tags', '--match=v*.*.*', '--abbrev=0'])).stdout.trim();
                    version = tag.replace(/^v/, '');
                } catch {}
            }

            if (inputs.command === 'bump') {
                return {
                    released,
                    ...(tag ? { tag } : {}),
                    ...(version ? { version } : {})
                };
            }
        }

        const result: OrchestrationResult = {
            released,
            ...(tag ? { tag } : {}),
            ...(version ? { version } : {})
        };

        // 3. Extracción de Changelog (Modo changelog o Modo release completo)
        if (inputs.command === 'changelog' || inputs.command === 'release') {
            const changelog = new ChangelogCommand(this.runner, {
                config: inputs.config,
                notesFile: inputs.notesFile,
                template: inputs.template
            });
            const notes = await changelog.execute();
            result.notesPath = inputs.notesFile;
            result.releaseNotes = notes;
        }

        return result;
    }
}