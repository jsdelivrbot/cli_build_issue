"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Subject_1 = require("rxjs/Subject");
const empty_1 = require("rxjs/observable/empty");
const of_1 = require("rxjs/observable/of");
const throw_1 = require("rxjs/observable/throw");
const exception_1 = require("../../exception/exception");
const path_1 = require("../path");
class SimpleMemoryHost {
    constructor() {
        this._cache = new Map();
        this._watchers = new Map();
    }
    _isDir(path) {
        for (const p of this._cache.keys()) {
            if (p.startsWith(path + path_1.NormalizedSep)) {
                return true;
            }
        }
        return false;
    }
    _updateWatchers(path, type) {
        const time = new Date();
        let currentPath = path;
        let parent = null;
        if (this._watchers.size == 0) {
            // Nothing to do if there's no watchers.
            return;
        }
        const maybeWatcher = this._watchers.get(currentPath);
        if (maybeWatcher) {
            maybeWatcher.forEach(watcher => {
                const [options, subject] = watcher;
                subject.next({ path, time, type });
                if (!options.persistent && type == 2 /* Deleted */) {
                    subject.complete();
                    this._watchers.delete(currentPath);
                }
            });
        }
        do {
            currentPath = parent !== null ? parent : currentPath;
            parent = path_1.dirname(currentPath);
            const maybeWatcher = this._watchers.get(currentPath);
            if (maybeWatcher) {
                maybeWatcher.forEach(watcher => {
                    const [options, subject] = watcher;
                    if (!options.recursive) {
                        return;
                    }
                    subject.next({ path, time, type });
                    if (!options.persistent && type == 2 /* Deleted */) {
                        subject.complete();
                        this._watchers.delete(currentPath);
                    }
                });
            }
        } while (parent != currentPath);
    }
    get capabilities() {
        return { synchronous: true };
    }
    write(path, content) {
        if (this._isDir(path)) {
            return throw_1._throw(new exception_1.PathIsDirectoryException(path));
        }
        const existed = this._cache.has(path);
        this._cache.set(path, content);
        this._updateWatchers(path, existed ? 0 /* Changed */ : 1 /* Created */);
        return empty_1.empty();
    }
    read(path) {
        if (this._isDir(path)) {
            return throw_1._throw(new exception_1.PathIsDirectoryException(path));
        }
        const maybeBuffer = this._cache.get(path);
        if (!maybeBuffer) {
            return throw_1._throw(new exception_1.FileDoesNotExistException(path));
        }
        else {
            return of_1.of(maybeBuffer);
        }
    }
    delete(path) {
        if (this._isDir(path)) {
            for (const [cachePath, _] of this._cache.entries()) {
                if (path.startsWith(cachePath + path_1.NormalizedSep)) {
                    this._cache.delete(cachePath);
                }
            }
        }
        else {
            this._cache.delete(path);
        }
        this._updateWatchers(path, 2 /* Deleted */);
        return empty_1.empty();
    }
    rename(from, to) {
        if (!this._cache.has(from)) {
            return throw_1._throw(new exception_1.FileDoesNotExistException(from));
        }
        else if (this._cache.has(to)) {
            return throw_1._throw(new exception_1.FileAlreadyExistException(from));
        }
        if (this._isDir(from)) {
            for (const path of this._cache.keys()) {
                if (path.startsWith(from + path_1.NormalizedSep)) {
                    const content = this._cache.get(path);
                    if (content) {
                        this._cache.set(path_1.join(to, path_1.NormalizedSep, path.slice(from.length)), content);
                    }
                }
            }
        }
        else {
            const content = this._cache.get(from);
            if (content) {
                this._cache.delete(from);
                this._cache.set(to, content);
            }
        }
        this._updateWatchers(from, 3 /* Renamed */);
        return empty_1.empty();
    }
    list(path) {
        if (this._cache.has(path)) {
            return throw_1._throw(new exception_1.PathIsFileException(path));
        }
        const fragments = path_1.split(path);
        const result = new Set();
        for (const p of this._cache.keys()) {
            if (p.startsWith(path + path_1.NormalizedSep)) {
                result.add(path_1.split(p)[fragments.length]);
            }
        }
        return of_1.of([...result]);
    }
    exists(path) {
        return of_1.of(this._cache.has(path) || this._isDir(path));
    }
    isDirectory(path) {
        return of_1.of(this._isDir(path));
    }
    isFile(path) {
        return of_1.of(this._cache.has(path));
    }
    stats(_path) {
        return null;
    }
    watch(path, options) {
        const subject = new Subject_1.Subject();
        let maybeWatcherArray = this._watchers.get(path);
        if (!maybeWatcherArray) {
            maybeWatcherArray = [];
            this._watchers.set(path, maybeWatcherArray);
        }
        maybeWatcherArray.push([options || {}, subject]);
        return subject.asObservable();
    }
}
exports.SimpleMemoryHost = SimpleMemoryHost;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtb3J5LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9oYW5zbC9Tb3VyY2VzL2hhbnNsL2RldmtpdC8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2NvcmUvc3JjL3ZpcnR1YWwtZnMvaG9zdC9tZW1vcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFRQSwwQ0FBdUM7QUFDdkMsaURBQThDO0FBQzlDLDJDQUF3RDtBQUN4RCxpREFBK0M7QUFDL0MseURBS21DO0FBQ25DLGtDQU9pQjtBQVlqQjtJQUFBO1FBQ1UsV0FBTSxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1FBQ3JDLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBdUQsQ0FBQztJQXNLckYsQ0FBQztJQXBLVyxNQUFNLENBQUMsSUFBVTtRQUN6QixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxvQkFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2QsQ0FBQztRQUNILENBQUM7UUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVTLGVBQWUsQ0FBQyxJQUFVLEVBQUUsSUFBd0I7UUFDNUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN4QixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxNQUFNLEdBQWdCLElBQUksQ0FBQztRQUUvQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLHdDQUF3QztZQUN4QyxNQUFNLENBQUM7UUFDVCxDQUFDO1FBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxH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QztJQUNsRSxDQUFDO0lBQ0QsV0FBVyxDQUFDLElBQVU7UUFDcEIsTUFBTSxDQUFDLE9BQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUNELE1BQU0sQ0FBQyxJQUFVO1FBQ2YsTUFBTSxDQUFDLE9BQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBVztRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQVUsRUFBRSxPQUEwQjtRQUMxQyxNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFPLEVBQWtCLENBQUM7UUFDOUMsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCxFQUFFLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUN2QixpQkFBaUIsR0FBRyxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVELGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUVqRCxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ2hDLENBQUM7Q0FDRjtBQXhLRCw0Q0F3S0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcy9PYnNlcnZhYmxlJztcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzL1N1YmplY3QnO1xuaW1wb3J0IHsgZW1wdHkgfSBmcm9tICdyeGpzL29ic2VydmFibGUvZW1wdHknO1xuaW1wb3J0IHsgb2YgYXMgb2JzZXJ2YWJsZU9mIH0gZnJvbSAncnhqcy9vYnNlcnZhYmxlL29mJztcbmltcG9ydCB7IF90aHJvdyB9IGZyb20gJ3J4anMvb2JzZXJ2YWJsZS90aHJvdyc7XG5pbXBvcnQge1xuICBGaWxlQWxyZWFkeUV4aXN0RXhjZXB0aW9uLFxuICBGaWxlRG9lc05vdEV4aXN0RXhjZXB0aW9uLFxuICBQYXRoSXNEaXJlY3RvcnlFeGNlcHRpb24sXG4gIFBhdGhJc0ZpbGVFeGNlcHRpb24sXG59IGZyb20gJy4uLy4uL2V4Y2VwdGlvbi9leGNlcHRpb24nO1xuaW1wb3J0IHtcbiAgTm9ybWFsaXplZFNlcCxcbiAgUGF0aCxcbiAgUGF0aEZyYWdtZW50LFxuICBkaXJuYW1lLFxuICBqb2luLFxuICBzcGxpdCxcbn0gZnJvbSAnLi4vcGF0aCc7XG5pbXBvcnQge1xuICBGaWxlQnVmZmVyLFxuICBIb3N0LFxuICBIb3N0Q2FwYWJpbGl0aWVzLFxuICBIb3N0V2F0Y2hFdmVudCxcbiAgSG9zdFdhdGNoRXZlbnRUeXBlLFxuICBIb3N0V2F0Y2hPcHRpb25zLFxuICBTdGF0cyxcbn0gZnJvbSAnLi9pbnRlcmZhY2UnO1xuXG5cbmV4cG9ydCBjbGFzcyBTaW1wbGVNZW1vcnlIb3N0IGltcGxlbWVudHMgSG9zdDx7fT4ge1xuICBwcml2YXRlIF9jYWNoZSA9IG5ldyBNYXA8UGF0aCwgRmlsZUJ1ZmZlcj4oKTtcbiAgcHJpdmF0ZSBfd2F0Y2hlcnMgPSBuZXcgTWFwPFBhdGgsIFtIb3N0V2F0Y2hPcHRpb25zLCBTdWJqZWN0PEhvc3RXYXRjaEV2ZW50Pl1bXT4oKTtcblxuICBwcm90ZWN0ZWQgX2lzRGlyKHBhdGg6IFBhdGgpIHtcbiAgICBmb3IgKGNvbnN0IHAgb2YgdGhpcy5fY2FjaGUua2V5cygpKSB7XG4gICAgICBpZiAocC5zdGFydHNXaXRoKHBhdGggKyBOb3JtYWxpemVkU2VwKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcm90ZWN0ZWQgX3VwZGF0ZVdhdGNoZXJzKHBhdGg6IFBhdGgsIHR5cGU6IEhvc3RXYXRjaEV2ZW50VHlwZSkge1xuICAgIGNvbnN0IHRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgIGxldCBjdXJyZW50UGF0aCA9IHBhdGg7XG4gICAgbGV0IHBhcmVudDogUGF0aCB8IG51bGwgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMuX3dhdGNoZXJzLnNpemUgPT0gMCkge1xuICAgICAgLy8gTm90aGluZyB0byBkbyBpZiB0aGVyZSdzIG5vIHdhdGNoZXJzLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1heWJlV2F0Y2hlciA9IHRoaXMuX3dhdGNoZXJzLmdldChjdXJyZW50UGF0aCk7XG4gICAgaWYgKG1heWJlV2F0Y2hlcikge1xuICAgICAgbWF5YmVXYXRjaGVyLmZvckVhY2god2F0Y2hlciA9PiB7XG4gICAgICAgIGNvbnN0IFtvcHRpb25zLCBzdWJqZWN0XSA9IHdhdGNoZXI7XG4gICAgICAgIHN1YmplY3QubmV4dCh7IHBhdGgsIHRpbWUsIHR5cGUgfSk7XG5cbiAgICAgICAgaWYgKCFvcHRpb25zLnBlcnNpc3RlbnQgJiYgdHlwZSA9PSBIb3N0V2F0Y2hFdmVudFR5cGUuRGVsZXRlZCkge1xuICAgICAgICAgIHN1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgICB0aGlzLl93YXRjaGVycy5kZWxldGUoY3VycmVudFBhdGgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBkbyB7XG4gICAgICBjdXJyZW50UGF0aCA9IHBhcmVudCAhPT0gbnVsbCA/IHBhcmVudCA6IGN1cnJlbnRQYXRoO1xuICAgICAgcGFyZW50ID0gZGlybmFtZShjdXJyZW50UGF0aCk7XG5cbiAgICAgIGNvbnN0IG1heWJlV2F0Y2hlciA9IHRoaXMuX3dhdGNoZXJzLmdldChjdXJyZW50UGF0aCk7XG4gICAgICBpZiAobWF5YmVXYXRjaGVyKSB7XG4gICAgICAgIG1heWJlV2F0Y2hlci5mb3JFYWNoKHdhdGNoZXIgPT4ge1xuICAgICAgICAgIGNvbnN0IFtvcHRpb25zLCBzdWJqZWN0XSA9IHdhdGNoZXI7XG4gICAgICAgICAgaWYgKCFvcHRpb25zLnJlY3Vyc2l2ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzdWJqZWN0Lm5leHQoeyBwYXRoLCB0aW1lLCB0eXBlIH0pO1xuXG4gICAgICAgICAgaWYgKCFvcHRpb25zLnBlcnNpc3RlbnQgJiYgdHlwZSA9PSBIb3N0V2F0Y2hFdmVudFR5cGUuRGVsZXRlZCkge1xuICAgICAgICAgICAgc3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgdGhpcy5fd2F0Y2hlcnMuZGVsZXRlKGN1cnJlbnRQYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKHBhcmVudCAhPSBjdXJyZW50UGF0aCk7XG4gIH1cblxuICBnZXQgY2FwYWJpbGl0aWVzKCk6IEhvc3RDYXBhYmlsaXRpZXMge1xuICAgIHJldHVybiB7IHN5bmNocm9ub3VzOiB0cnVlIH07XG4gIH1cblxuICB3cml0ZShwYXRoOiBQYXRoLCBjb250ZW50OiBGaWxlQnVmZmVyKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX2lzRGlyKHBhdGgpKSB7XG4gICAgICByZXR1cm4gX3Rocm93KG5ldyBQYXRoSXNEaXJlY3RvcnlFeGNlcHRpb24ocGF0aCkpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4aXN0ZWQgPSB0aGlzLl9jYWNoZS5oYXMocGF0aCk7XG4gICAgdGhpcy5fY2FjaGUuc2V0KHBhdGgsIGNvbnRlbnQpO1xuICAgIHRoaXMuX3VwZGF0ZVdhdGNoZXJzKHBhdGgsIGV4aXN0ZWQgPyBIb3N0V2F0Y2hFdmVudFR5cGUuQ2hhbmdlZCA6IEhvc3RXYXRjaEV2ZW50VHlwZS5DcmVhdGVkKTtcblxuICAgIHJldHVybiBlbXB0eTx2b2lkPigpO1xuICB9XG4gIHJlYWQocGF0aDogUGF0aCk6IE9ic2VydmFibGU8RmlsZUJ1ZmZlcj4ge1xuICAgIGlmICh0aGlzLl9pc0RpcihwYXRoKSkge1xuICAgICAgcmV0dXJuIF90aHJvdyhuZXcgUGF0aElzRGlyZWN0b3J5RXhjZXB0aW9uKHBhdGgpKTtcbiAgICB9XG4gICAgY29uc3QgbWF5YmVCdWZmZXIgPSB0aGlzLl9jYWNoZS5nZXQocGF0aCk7XG4gICAgaWYgKCFtYXliZUJ1ZmZlcikge1xuICAgICAgcmV0dXJuIF90aHJvdyhuZXcgRmlsZURvZXNOb3RFeGlzdEV4Y2VwdGlvbihwYXRoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvYnNlcnZhYmxlT2YobWF5YmVCdWZmZXIpO1xuICAgIH1cbiAgfVxuICBkZWxldGUocGF0aDogUGF0aCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9pc0RpcihwYXRoKSkge1xuICAgICAgZm9yIChjb25zdCBbY2FjaGVQYXRoLCBfXSBvZiB0aGlzLl9jYWNoZS5lbnRyaWVzKCkpIHtcbiAgICAgICAgaWYgKHBhdGguc3RhcnRzV2l0aChjYWNoZVBhdGggKyBOb3JtYWxpemVkU2VwKSkge1xuICAgICAgICAgIHRoaXMuX2NhY2hlLmRlbGV0ZShjYWNoZVBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NhY2hlLmRlbGV0ZShwYXRoKTtcbiAgICB9XG4gICAgdGhpcy5fdXBkYXRlV2F0Y2hlcnMocGF0aCwgSG9zdFdhdGNoRXZlbnRUeXBlLkRlbGV0ZWQpO1xuXG4gICAgcmV0dXJuIGVtcHR5KCk7XG4gIH1cbiAgcmVuYW1lKGZyb206IFBhdGgsIHRvOiBQYXRoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLl9jYWNoZS5oYXMoZnJvbSkpIHtcbiAgICAgIHJldHVybiBfdGhyb3cobmV3IEZpbGVEb2VzTm90RXhpc3RFeGNlcHRpb24oZnJvbSkpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fY2FjaGUuaGFzKHRvKSkge1xuICAgICAgcmV0dXJuIF90aHJvdyhuZXcgRmlsZUFscmVhZHlFeGlzdEV4Y2VwdGlvbihmcm9tKSk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9pc0Rpcihmcm9tKSkge1xuICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHRoaXMuX2NhY2hlLmtleXMoKSkge1xuICAgICAgICBpZiAocGF0aC5zdGFydHNXaXRoKGZyb20gKyBOb3JtYWxpemVkU2VwKSkge1xuICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLl9jYWNoZS5nZXQocGF0aCk7XG4gICAgICAgICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlLnNldChqb2luKHRvLCBOb3JtYWxpemVkU2VwLCBwYXRoLnNsaWNlKGZyb20ubGVuZ3RoKSksIGNvbnRlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5fY2FjaGUuZ2V0KGZyb20pO1xuICAgICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgICAgdGhpcy5fY2FjaGUuZGVsZXRlKGZyb20pO1xuICAgICAgICB0aGlzLl9jYWNoZS5zZXQodG8sIGNvbnRlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZVdhdGNoZXJzKGZyb20sIEhvc3RXYXRjaEV2ZW50VHlwZS5SZW5hbWVkKTtcblxuICAgIHJldHVybiBlbXB0eSgpO1xuICB9XG5cbiAgbGlzdChwYXRoOiBQYXRoKTogT2JzZXJ2YWJsZTxQYXRoRnJhZ21lbnRbXT4ge1xuICAgIGlmICh0aGlzLl9jYWNoZS5oYXMocGF0aCkpIHtcbiAgICAgIHJldHVybiBfdGhyb3cobmV3IFBhdGhJc0ZpbGVFeGNlcHRpb24ocGF0aCkpO1xuICAgIH1cbiAgICBjb25zdCBmcmFnbWVudHMgPSBzcGxpdChwYXRoKTtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgU2V0PFBhdGhGcmFnbWVudD4oKTtcbiAgICBmb3IgKGNvbnN0IHAgb2YgdGhpcy5fY2FjaGUua2V5cygpKSB7XG4gICAgICBpZiAocC5zdGFydHNXaXRoKHBhdGggKyBOb3JtYWxpemVkU2VwKSkge1xuICAgICAgICByZXN1bHQuYWRkKHNwbGl0KHApW2ZyYWdtZW50cy5sZW5ndGhdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JzZXJ2YWJsZU9mKFsuLi5yZXN1bHRdKTtcbiAgfVxuXG4gIGV4aXN0cyhwYXRoOiBQYXRoKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG9ic2VydmFibGVPZih0aGlzLl9jYWNoZS5oYXMocGF0aCkgfHwgdGhpcy5faXNEaXIocGF0aCkpO1xuICB9XG4gIGlzRGlyZWN0b3J5KHBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gb2JzZXJ2YWJsZU9mKHRoaXMuX2lzRGlyKHBhdGgpKTtcbiAgfVxuICBpc0ZpbGUocGF0aDogUGF0aCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBvYnNlcnZhYmxlT2YodGhpcy5fY2FjaGUuaGFzKHBhdGgpKTtcbiAgfVxuXG4gIHN0YXRzKF9wYXRoOiBQYXRoKTogT2JzZXJ2YWJsZTxTdGF0czx7fT4+IHwgbnVsbCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB3YXRjaChwYXRoOiBQYXRoLCBvcHRpb25zPzogSG9zdFdhdGNoT3B0aW9ucyk6IE9ic2VydmFibGU8SG9zdFdhdGNoRXZlbnQ+IHwgbnVsbCB7XG4gICAgY29uc3Qgc3ViamVjdCA9IG5ldyBTdWJqZWN0PEhvc3RXYXRjaEV2ZW50PigpO1xuICAgIGxldCBtYXliZVdhdGNoZXJBcnJheSA9IHRoaXMuX3dhdGNoZXJzLmdldChwYXRoKTtcbiAgICBpZiAoIW1heWJlV2F0Y2hlckFycmF5KSB7XG4gICAgICBtYXliZVdhdGNoZXJBcnJheSA9IFtdO1xuICAgICAgdGhpcy5fd2F0Y2hlcnMuc2V0KHBhdGgsIG1heWJlV2F0Y2hlckFycmF5KTtcbiAgICB9XG5cbiAgICBtYXliZVdhdGNoZXJBcnJheS5wdXNoKFtvcHRpb25zIHx8IHt9LCBzdWJqZWN0XSk7XG5cbiAgICByZXR1cm4gc3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxufVxuIl19