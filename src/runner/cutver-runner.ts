import * as exec from '@actions/exec';

export class CutverRunner {
    constructor(private readonly configPath?: string) { }

    async run(args: string[]): Promise<string> {
        const finalArgs: string[] = [];

        if (this.configPath) {
            finalArgs.push('-c', this.configPath);
        }

        finalArgs.push(...args);

        let stdout = '';
        let stderr = '';

        const options: exec.ExecOptions = {
            listeners: {
                stdout: (data: Buffer) => {
                    stdout += data.toString();
                },
                stderr: (data: Buffer) => {
                    stderr += data.toString();
                }
            },
            ignoreReturnCode: true
        };

        const exitCode = await exec.exec('cutver', finalArgs, options);

        if (exitCode !== 0) {
            throw new Error(`Falló 'cutver ${finalArgs.join(' ')}':\n${stderr.trim()}`);
        }

        return stdout.trim();
    }
}