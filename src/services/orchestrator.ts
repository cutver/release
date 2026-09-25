import type { CutverRunner } from '../runner/cutver-runner';
import type { ActionInputs } from '../types/options';
import { DoctorCommand } from '../commands/doctor-command';
import { BumpCommand } from '../commands/bump-command';
import { ChangelogCommand } from '../commands/changelog-command';

export interface OrchestrationResult {
    notesPath?: string;
    releaseNotes?: string;
}

export class ReleaseOrchestrator {
    constructor(private readonly runner: CutverRunner) { }

    async execute(inputs: ActionInputs): Promise<OrchestrationResult> {
        const result: OrchestrationResult = {};

        if (inputs.command === 'doctor' || inputs.command === 'release') {
            const doctor = new DoctorCommand(this.runner, {
                config: inputs.config,
                checkChangelog: inputs.checkChangelog
            });
            await doctor.execute();
            if (inputs.command === 'doctor') return result;
        }

        if (inputs.command === 'bump' || inputs.command === 'release') {
            const bump = new BumpCommand(this.runner, {
                config: inputs.config,
                level: inputs.bump,
                dryRun: inputs.dryRun,
                skipPreflight: inputs.skipPreflight
            });
            await bump.execute();
            if (inputs.command === 'bump') return result;
        }

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