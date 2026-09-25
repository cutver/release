import type { ICommand } from '../types/options';
import type { CutverRunner } from '../runner/cutver-runner';

export abstract class BaseCommand<T = void> implements ICommand<T> {
    constructor(protected readonly runner: CutverRunner) { }
    abstract execute(): Promise<T>;
}