export class Method {
    public func!: Function;
    public thisObj!: any;
    public args: any;
    public once: boolean;

    public constructor(func: Function, thisObj: any, args?: any, once = false) {
        this.func = func;
        this.thisObj = thisObj;
        this.args = args;
        this.once = once;
    }

    public apply(): any {
        return this.func.call(this.thisObj, this.args);
    }

    public applyWith(data: Array<any>): any {
        if (!data || this.length === 0) {
            return this.apply();
        }

        return this.func.call(this.thisObj, this.args ? Object.assign({}, this.args, data) : data);
    }

    public clone(): Method {
        return new Method(this.func, this.thisObj, this.args, this.once);
    }

    public equal(other: Method) {
        return other.func === this.func && other.thisObj === this.thisObj;
    }

    public get length(): number {
        return this.func.length;
    }
}
