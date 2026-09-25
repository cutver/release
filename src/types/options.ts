export type ActionCommand = 'release' | 'bump' | 'changelog' | 'doctor';
export type BumpLevel = 'patch' | 'minor' | 'major' | 'auto';

export interface CommonCliOptions {
    config?: string | undefined;
}

export interface DoctorOptions extends CommonCliOptions {
    checkChangelog: boolean;
}

export interface BumpOptions extends CommonCliOptions {
    level: BumpLevel;
    dryRun: boolean;
    skipPreflight?: string[] | undefined;
}

export interface ChangelogOptions extends CommonCliOptions {
    notesFile: string;
    template?: string | undefined;
}

export interface ActionInputs {
    command: ActionCommand;
    bump: BumpLevel;
    config?: string | undefined;
    dryRun: boolean;
    skipPreflight?: string[] | undefined;
    checkChangelog: boolean;
    notesFile: string;
    template?: string | undefined;
}

export interface ICommand<T = void> {
    execute(): Promise<T>;
}