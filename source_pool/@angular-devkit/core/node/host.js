"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const fs = require("fs");
const Observable_1 = require("rxjs/Observable");
const empty_1 = require("rxjs/observable/empty");
const from_1 = require("rxjs/observable/from");
const of_1 = require("rxjs/observable/of");
const concat_1 = require("rxjs/operators/concat");
const concatMap_1 = require("rxjs/operators/concatMap");
const ignoreElements_1 = require("rxjs/operators/ignoreElements");
const map_1 = require("rxjs/operators/map");
const mergeMap_1 = require("rxjs/operators/mergeMap");
const publish_1 = require("rxjs/operators/publish");
const refCount_1 = require("rxjs/operators/refCount");
const { FSWatcher } = require('chokidar');
function _callFs(fn, ...args) {
    return new Observable_1.Observable(obs => {
        fn(...args, (err, result) => {
            if (err) {
                obs.error(err);
            }
            else {
                obs.next(result);
                obs.complete();
            }
        });
    });
}
/**
 * An implementation of the Virtual FS using Node as the background. There are two versions; one
 * synchronous and one asynchronous.
 */
class NodeJsAsyncHost {
    _getSystemPath(path) {
        if (process.platform.startsWith('win32')) {
            return core_1.asWindowsPath(path);
        }
        else {
            return core_1.asPosixPath(path);
        }
    }
    get capabilities() {
        return { synchronous: false };
    }
    write(path, content) {
        return new Observable_1.Observable(obs => {
            // Create folders if necessary.
            const _createDir = (path) => {
                if (fs.existsSync(this._getSystemPath(path))) {
                    return;
                }
                if (core_1.dirname(path) === path) {
                    throw new Error();
                }
                _createDir(core_1.dirname(path));
                fs.mkdirSync(this._getSystemPath(path));
            };
            _createDir(core_1.dirname(path));
            _callFs(fs.writeFile, this._getSystemPath(path), new Uint8Array(content)).subscribe(obs);
        });
    }
    read(path) {
        return _callFs(fs.readFile, this._getSystemPath(path)).pipe(map_1.map(buffer => new Uint8Array(buffer).buffer));
    }
    delete(path) {
        return this.isDirectory(path).pipe(mergeMap_1.mergeMap(isDirectory => {
            if (isDirectory) {
                const allFiles = [];
                const allDirs = [];
                const _recurseList = (path) => {
                    for (const fragment of fs.readdirSync(this._getSystemPath(path))) {
                        if (fs.statSync(this._getSystemPath(core_1.join(path, fragment))).isDirectory()) {
                            _recurseList(core_1.join(path, fragment));
                            allDirs.push(core_1.join(path, fragment));
                        }
                        else {
                            allFiles.push(core_1.join(path, fragment));
                        }
                    }
                };
                _recurseList(path);
                return from_1.from(allFiles)
                    .pipe(mergeMap_1.mergeMap(p => _callFs(fs.unlink, this._getSystemPath(p))), ignoreElements_1.ignoreElements(), concat_1.concat(from_1.from(allDirs).pipe(concatMap_1.concatMap(p => _callFs(fs.rmdir, this._getSystemPath(p))))), map_1.map(() => { }));
            }
            else {
                return _callFs(fs.unlink, this._getSystemPath(path));
            }
        }));
    }
    rename(from, to) {
        return _callFs(fs.rename, this._getSystemPath(from), this._getSystemPath(to));
    }
    list(path) {
        return _callFs(fs.readdir, this._getSystemPath(path)).pipe(map_1.map(names => names.map(name => core_1.fragment(name))));
    }
    exists(path) {
        // Exists is a special case because it cannot error.
        return new Observable_1.Observable(obs => {
            fs.exists(path, exists => {
                obs.next(exists);
                obs.complete();
            });
        });
    }
    isDirectory(path) {
        return _callFs(fs.stat, this._getSystemPath(path)).pipe(map_1.map(stat => stat.isDirectory()));
    }
    isFile(path) {
        return _callFs(fs.stat, this._getSystemPath(path)).pipe(map_1.map(stat => stat.isDirectory()));
    }
    // Some hosts may not support stats.
    stats(path) {
        return _callFs(fs.stat, this._getSystemPath(path));
    }
    // Some hosts may not support watching.
    watch(path, _options) {
        return new Observable_1.Observable(obs => {
            const watcher = new FSWatcher({ persistent: true }).add(this._getSystemPath(path));
            watcher
                .on('change', path => {
                obs.next({
                    path: core_1.normalize(path),
                    time: new Date(),
                    type: 0 /* Changed */,
                });
            })
                .on('add', path => {
                obs.next({
                    path: core_1.normalize(path),
                    time: new Date(),
                    type: 1 /* Created */,
                });
            })
                .on('unlink', path => {
                obs.next({
                    path: core_1.normalize(path),
                    time: new Date(),
                    type: 2 /* Deleted */,
                });
            });
            return () => watcher.close();
        }).pipe(publish_1.publish(), refCount_1.refCount());
    }
}
exports.NodeJsAsyncHost = NodeJsAsyncHost;
/**
 * An implementation of the Virtual FS using Node as the backend, synchronously.
 */
class NodeJsSyncHost {
    _getSystemPath(path) {
        if (process.platform.startsWith('win32')) {
            return core_1.asWindowsPath(path);
        }
        else {
            return core_1.asPosixPath(path);
        }
    }
    get capabilities() {
        return { synchronous: true };
    }
    write(path, content) {
        // Create folders if necessary.
        const _createDir = (path) => {
            if (fs.existsSync(this._getSystemPath(path))) {
                return;
            }
            _createDir(core_1.dirname(path));
            fs.mkdirSync(path);
        };
        _createDir(core_1.dirname(path));
        fs.writeFileSync(this._getSystemPath(path), new Uint8Array(content));
        return empty_1.empty();
    }
    read(path) {
        const buffer = fs.readFileSync(this._getSystemPath(path));
        return of_1.of(new Uint8Array(buffer).buffer);
    }
    delete(path) {
        if (this.isDirectory(path)) {
            // Since this is synchronous, we can recurse and safely ignore the result.
            for (const name of fs.readdirSync(this._getSystemPath(path))) {
                this.delete(core_1.join(path, name));
            }
            fs.rmdirSync(this._getSystemPath(path));
        }
        else {
            fs.unlinkSync(this._getSystemPath(path));
        }
        return empty_1.empty();
    }
    rename(from, to) {
        fs.renameSync(this._getSystemPath(from), this._getSystemPath(to));
        return empty_1.empty();
    }
    list(path) {
        return of_1.of(fs.readdirSync(this._getSystemPath(path))).pipe(map_1.map(names => names.map(name => core_1.fragment(name))));
    }
    exists(path) {
        return of_1.of(fs.existsSync(this._getSystemPath(path)));
    }
    isDirectory(path) {
        // tslint:disable-next-line:non-null-operator
        return this.stats(path).pipe(map_1.map(stat => stat.isDirectory()));
    }
    isFile(path) {
        // tslint:disable-next-line:non-null-operator
        return this.stats(path).pipe(map_1.map(stat => stat.isFile()));
    }
    // Some hosts may not support stats.
    stats(path) {
        return of_1.of(fs.statSync(this._getSystemPath(path)));
    }
    // Some hosts may not support watching.
    watch(path, _options) {
        return new Observable_1.Observable(obs => {
            const opts = { persistent: false };
            const watcher = new FSWatcher(opts).add(this._getSystemPath(path));
            watcher
                .on('change', path => {
                obs.next({
                    path: core_1.normalize(path),
                    time: new Date(),
                    type: 0 /* Changed */,
                });
            })
                .on('add', path => {
                obs.next({
                    path: core_1.normalize(path),
                    time: new Date(),
                    type: 1 /* Created */,
                });
            })
                .on('unlink', path => {
                obs.next({
                    path: core_1.normalize(path),
                    time: new Date(),
                    type: 2 /* Deleted */,
                });
            });
            return () => watcher.close();
        }).pipe(publish_1.publish(), refCount_1.refCount());
    }
}
exports.NodeJsSyncHost = NodeJsSyncHost;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9zdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvaGFuc2wvU291cmNlcy9oYW5zbC9kZXZraXQvIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9jb3JlL25vZGUvaG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtDQVU4QjtBQUM5Qix5QkFBeUI7QUFDekIsZ0RBQTZDO0FBQzdDLGlEQUE4QztBQUM5QywrQ0FBOEQ7QUFDOUQsMkNBQXdEO0FBQ3hELGtEQUErQztBQUMvQyx3REFBcUQ7QUFDckQsa0VBQStEO0FBQy9ELDRDQUF5QztBQUN6QyxzREFBbUQ7QUFDbkQsb0RBQWlEO0FBQ2pELHNEQUFtRDtBQWNuRCxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQW1DLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQWExRSxpQkFBMEIsRUFBWSxFQUFFLEdBQUcsSUFBVTtJQUNuRCxNQUFNLENBQUMsSUFBSSx1QkFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQzFCLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQVcsRUFBRSxNQUFnQixFQUFFLEVBQUU7WUFDNUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDUixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNqQixHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBR0Q7OztHQUdHO0FBQ0g7SUFDWSxjQUFjLENBQUMsSUFBVTtRQUNqQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENB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QUNuQyxNQUFNLE9BQU8sR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRW5FLE9BQU87aUJBQ0osRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDbkIsR0FBRyxDQUFDLElBQUksQ0FBQztvQkFDUCxJQUFJLEVBQUUsZ0JBQVMsQ0FBQyxJQUFJLENBQUM7b0JBQ3JCLElBQUksRUFBRSxJQUFJLElBQUksRUFBRTtvQkFDaEIsSUFBSSxpQkFBc0M7aUJBQzNDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQztpQkFDRCxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNoQixHQUFHLENBQUMsSUFBSSxDQUFDO29CQUNQLElBQUksRUFBRSxnQkFBUyxDQUFDLElBQUksQ0FBQztvQkFDckIsSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFO29CQUNoQixJQUFJLGlCQUFzQztpQkFDM0MsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDO2lCQUNELEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ25CLEdBQUcsQ0FBQyxJQUFJLENBQUM7b0JBQ1AsSUFBSSxFQUFFLGdCQUFTLENBQUMsSUFBSSxDQUFDO29CQUNyQixJQUFJLEVBQUUsSUFBSSxJQUFJLEVBQUU7b0JBQ2hCLElBQUksaUJBQXNDO2lCQUMzQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUVMLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUNMLGlCQUFPLEVBQUUsRUFDVCxtQkFBUSxFQUFFLENBQ1gsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQXBIRCx3Q0FvSEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1xuICBQYXRoLFxuICBQYXRoRnJhZ21lbnQsXG4gIGFzUG9zaXhQYXRoLFxuICBhc1dpbmRvd3NQYXRoLFxuICBkaXJuYW1lLFxuICBmcmFnbWVudCxcbiAgam9pbixcbiAgbm9ybWFsaXplLFxuICB2aXJ0dWFsRnMsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzL09ic2VydmFibGUnO1xuaW1wb3J0IHsgZW1wdHkgfSBmcm9tICdyeGpzL29ic2VydmFibGUvZW1wdHknO1xuaW1wb3J0IHsgZnJvbSBhcyBvYnNlcnZhYmxlRnJvbSB9IGZyb20gJ3J4anMvb2JzZXJ2YWJsZS9mcm9tJztcbmltcG9ydCB7IG9mIGFzIG9ic2VydmFibGVPZiB9IGZyb20gJ3J4anMvb2JzZXJ2YWJsZS9vZic7XG5pbXBvcnQgeyBjb25jYXQgfSBmcm9tICdyeGpzL29wZXJhdG9ycy9jb25jYXQnO1xuaW1wb3J0IHsgY29uY2F0TWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMvY29uY2F0TWFwJztcbmltcG9ydCB7IGlnbm9yZUVsZW1lbnRzIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMvaWdub3JlRWxlbWVudHMnO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMvbWFwJztcbmltcG9ydCB7IG1lcmdlTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMvbWVyZ2VNYXAnO1xuaW1wb3J0IHsgcHVibGlzaCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzL3B1Ymxpc2gnO1xuaW1wb3J0IHsgcmVmQ291bnQgfSBmcm9tICdyeGpzL29wZXJhdG9ycy9yZWZDb3VudCc7XG5cblxuaW50ZXJmYWNlIENob2tpZGFyV2F0Y2hlciB7XG4gIG5ldyAob3B0aW9uczoge30pOiBDaG9raWRhcldhdGNoZXI7XG5cbiAgYWRkKHBhdGg6IHN0cmluZyk6IENob2tpZGFyV2F0Y2hlcjtcbiAgb24odHlwZTogJ2NoYW5nZScsIGNiOiAocGF0aDogc3RyaW5nKSA9PiB2b2lkKTogQ2hva2lkYXJXYXRjaGVyO1xuICBvbih0eXBlOiAnYWRkJywgY2I6IChwYXRoOiBzdHJpbmcpID0+IHZvaWQpOiBDaG9raWRhcldhdGNoZXI7XG4gIG9uKHR5cGU6ICd1bmxpbmsnLCBjYjogKHBhdGg6IHN0cmluZykgPT4gdm9pZCk6IENob2tpZGFyV2F0Y2hlcjtcblxuICBjbG9zZSgpOiB2b2lkO1xufVxuXG5jb25zdCB7IEZTV2F0Y2hlciB9OiB7IEZTV2F0Y2hlcjogQ2hva2lkYXJXYXRjaGVyIH0gPSByZXF1aXJlKCdjaG9raWRhcicpO1xuXG5cbnR5cGUgRnNGdW5jdGlvbjA8Uj4gPSAoY2I6IChlcnI/OiBFcnJvciwgcmVzdWx0PzogUikgPT4gdm9pZCkgPT4gdm9pZDtcbnR5cGUgRnNGdW5jdGlvbjE8UiwgVDE+ID0gKHAxOiBUMSwgY2I6IChlcnI/OiBFcnJvciwgcmVzdWx0PzogUikgPT4gdm9pZCkgPT4gdm9pZDtcbnR5cGUgRnNGdW5jdGlvbjI8UiwgVDEsIFQyPlxuICA9IChwMTogVDEsIHAyOiBUMiwgY2I6IChlcnI/OiBFcnJvciwgcmVzdWx0PzogUikgPT4gdm9pZCkgPT4gdm9pZDtcblxuXG5mdW5jdGlvbiBfY2FsbEZzPFI+KGZuOiBGc0Z1bmN0aW9uMDxSPik6IE9ic2VydmFibGU8Uj47XG5mdW5jdGlvbiBfY2FsbEZzPFIsIFQxPihmbjogRnNGdW5jdGlvbjE8UiwgVDE+LCBwMTogVDEpOiBPYnNlcnZhYmxlPFI+O1xuZnVuY3Rpb24gX2NhbGxGczxSLCBUMSwgVDI+KGZuOiBGc0Z1bmN0aW9uMjxSLCBUMSwgVDI+LCBwMTogVDEsIHAyOiBUMik6IE9ic2VydmFibGU8Uj47XG5cbmZ1bmN0aW9uIF9jYWxsRnM8UmVzdWx0VD4oZm46IEZ1bmN0aW9uLCAuLi5hcmdzOiB7fVtdKTogT2JzZXJ2YWJsZTxSZXN1bHRUPiB7XG4gIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnMgPT4ge1xuICAgIGZuKC4uLmFyZ3MsIChlcnI/OiBFcnJvciwgcmVzdWx0PzogUmVzdWx0VCkgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBvYnMuZXJyb3IoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9icy5uZXh0KHJlc3VsdCk7XG4gICAgICAgIG9icy5jb21wbGV0ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuXG4vKipcbiAqIEFuIGltcGxlbWVudGF0aW9uIG9mIHRoZSBWaXJ0dWFsIEZTIHVzaW5nIE5vZGUgYXMgdGhlIGJhY2tncm91bmQuIFRoZXJlIGFyZSB0d28gdmVyc2lvbnM7IG9uZVxuICogc3luY2hyb25vdXMgYW5kIG9uZSBhc3luY2hyb25vdXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBOb2RlSnNBc3luY0hvc3QgaW1wbGVtZW50cyB2aXJ0dWFsRnMuSG9zdDxmcy5TdGF0cz4ge1xuICBwcm90ZWN0ZWQgX2dldFN5c3RlbVBhdGgocGF0aDogUGF0aCk6IHN0cmluZyB7XG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0uc3RhcnRzV2l0aCgnd2luMzInKSkge1xuICAgICAgcmV0dXJuIGFzV2luZG93c1BhdGgocGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhc1Bvc2l4UGF0aChwYXRoKTtcbiAgICB9XG4gIH1cblxuICBnZXQgY2FwYWJpbGl0aWVzKCk6IHZpcnR1YWxGcy5Ib3N0Q2FwYWJpbGl0aWVzIHtcbiAgICByZXR1cm4geyBzeW5jaHJvbm91czogZmFsc2UgfTtcbiAgfVxuXG4gIHdyaXRlKHBhdGg6IFBhdGgsIGNvbnRlbnQ6IHZpcnR1YWxGcy5GaWxlQnVmZmVyKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlPHZvaWQ+KG9icyA9PiB7XG4gICAgICAvLyBDcmVhdGUgZm9sZGVycyBpZiBuZWNlc3NhcnkuXG4gICAgICBjb25zdCBfY3JlYXRlRGlyID0gKHBhdGg6IFBhdGgpID0+IHtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmModGhpcy5fZ2V0U3lzdGVtUGF0aChwYXRoKSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRpcm5hbWUocGF0aCkgPT09IHBhdGgpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgICBfY3JlYXRlRGlyKGRpcm5hbWUocGF0aCkpO1xuICAgICAgICBmcy5ta2RpclN5bmModGhpcy5fZ2V0U3lzdGVtUGF0aChwYXRoKSk7XG4gICAgICB9O1xuICAgICAgX2NyZWF0ZURpcihkaXJuYW1lKHBhdGgpKTtcblxuICAgICAgX2NhbGxGczx2b2lkLCBzdHJpbmcsIFVpbnQ4QXJyYXk+KFxuICAgICAgICBmcy53cml0ZUZpbGUsXG4gICAgICAgIHRoaXMuX2dldFN5c3RlbVBhdGgocGF0aCksXG4gICAgICAgIG5ldyBVaW50OEFycmF5KGNvbnRlbnQpLFxuICAgICAgKS5zdWJzY3JpYmUob2JzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlYWQocGF0aDogUGF0aCk6IE9ic2VydmFibGU8dmlydHVhbEZzLkZpbGVCdWZmZXI+IHtcbiAgICByZXR1cm4gX2NhbGxGcyhmcy5yZWFkRmlsZSwgdGhpcy5fZ2V0U3lzdGVtUGF0aChwYXRoKSkucGlwZShcbiAgICAgIG1hcChidWZmZXIgPT4gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKS5idWZmZXIgYXMgdmlydHVhbEZzLkZpbGVCdWZmZXIpLFxuICAgICk7XG4gIH1cblxuICBkZWxldGUocGF0aDogUGF0aCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmlzRGlyZWN0b3J5KHBhdGgpLnBpcGUoXG4gICAgICBtZXJnZU1hcChpc0RpcmVjdG9yeSA9PiB7XG4gICAgICAgIGlmIChpc0RpcmVjdG9yeSkge1xuICAgICAgICAgIGNvbnN0IGFsbEZpbGVzOiBQYXRoW10gPSBbXTtcbiAgICAgICAgICBjb25zdCBhbGxEaXJzOiBQYXRoW10gPSBbXTtcbiAgICAgICAgICBjb25zdCBfcmVjdXJzZUxpc3QgPSAocGF0aDogUGF0aCkgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCBmcmFnbWVudCBvZiBmcy5yZWFkZGlyU3luYyh0aGlzLl9nZXRTeXN0ZW1QYXRoKHBhdGgpKSkge1xuICAgICAgICAgICAgICBpZiAoZnMuc3RhdFN5bmModGhpcy5fZ2V0U3lzdGVtUGF0aChqb2luKHBhdGgsIGZyYWdtZW50KSkpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICBfcmVjdXJzZUxpc3Qoam9pbihwYXRoLCBmcmFnbWVudCkpO1xuICAgICAgICAgICAgICAgIGFsbERpcnMucHVzaChqb2luKHBhdGgsIGZyYWdtZW50KSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYWxsRmlsZXMucHVzaChqb2luKHBhdGgsIGZyYWdtZW50KSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIF9yZWN1cnNlTGlzdChwYXRoKTtcblxuICAgICAgICAgIHJldHVybiBvYnNlcnZhYmxlRnJvbShhbGxGaWxlcylcbiAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICBtZXJnZU1hcChwID0+IF9jYWxsRnMoZnMudW5saW5rLCB0aGlzLl9nZXRTeXN0ZW1QYXRoKHApKSksXG4gICAgICAgICAgICAgIGlnbm9yZUVsZW1lbnRzKCksXG4gICAgICAgICAgICAgIGNvbmNhdChvYnNlcnZhYmxlRnJvbShhbGxEaXJzKS5waXBlKFxuICAgICAgICAgICAgICAgIGNvbmNhdE1hcChwID0+IF9jYWxsRnMoZnMucm1kaXIsIHRoaXMuX2dldFN5c3RlbVBhdGgocCkpKSxcbiAgICAgICAgICAgICAgKSksXG4gICAgICAgICAgICAgIG1hcCgoKSA9PiB7fSksXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBfY2FsbEZzKGZzLnVubGluaywgdGhpcy5fZ2V0U3lzdGVtUGF0aChwYXRoKSk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICByZW5hbWUoZnJvbTogUGF0aCwgdG86IFBhdGgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gX2NhbGxGcyhmcy5yZW5hbWUsIHRoaXMuX2dldFN5c3RlbVBhdGgoZnJvbSksIHRoaXMuX2dldFN5c3RlbVBhdGgodG8pKTtcbiAgfVxuXG4gIGxpc3QocGF0aDogUGF0aCk6IE9ic2VydmFibGU8UGF0aEZyYWdtZW50W10+IHtcbiAgICByZXR1cm4gX2NhbGxGcyhmcy5yZWFkZGlyLCB0aGlzLl9nZXRTeXN0ZW1QYXRoKHBhdGgpKS5waXBlKFxuICAgICAgbWFwKG5hbWVzID0+IG5hbWVzLm1hcChuYW1lID0+IGZyYWdtZW50KG5hbWUpKSksXG4gICAgKTtcbiAgfVxuXG4gIGV4aXN0cyhwYXRoOiBQYXRoKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgLy8gRXhpc3RzIGlzIGEgc3BlY2lhbCBjYXNlIGJlY2F1c2UgaXQgY2Fubm90IGVycm9yLlxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnMgPT4ge1xuICAgICAgZnMuZXhpc3RzKHBhdGgsIGV4aXN0cyA9PiB7XG4gICAgICAgIG9icy5uZXh0KGV4aXN0cyk7XG4gICAgICAgIG9icy5jb21wbGV0ZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBpc0RpcmVjdG9yeShwYXRoOiBQYXRoKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIF9jYWxsRnMoZnMuc3RhdCwgdGhpcy5fZ2V0U3lzdGVtUGF0aChwYXRoKSkucGlwZShcbiAgICAgIG1hcChzdGF0ID0+IHN0YXQuaXNEaXJlY3RvcnkoKSksXG4gICAgKTtcbiAgfVxuICBpc0ZpbGUocGF0aDogUGF0aCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBfY2FsbEZzKGZzLnN0YXQsIHRoaXMuX2dldFN5c3RlbVBhdGgocGF0aCkpLnBpcGUoXG4gICAgICBtYXAoc3RhdCA9PiBzdGF0LmlzRGlyZWN0b3J5KCkpLFxuICAgICk7XG4gIH1cblxuICAvLyBTb21lIGhvc3RzIG1heSBub3Qgc3VwcG9ydCBzdGF0cy5cbiAgc3RhdHMocGF0aDogUGF0aCk6IE9ic2VydmFibGU8dmlydHVhbEZzLlN0YXRzPGZzLlN0YXRzPj4gfCBudWxsIHtcbiAgICByZXR1cm4gX2NhbGxGcyhmcy5zdGF0LCB0aGlzLl9nZXRTeXN0ZW1QYXRoKHBhdGgpKTtcbiAgfVxuXG4gIC8vIFNvbWUgaG9zdHMgbWF5IG5vdCBzdXBwb3J0IHdhdGNoaW5nLlxuICB3YXRjaChcbiAgICBwYXRoOiBQYXRoLFxuICAgIF9vcHRpb25zPzogdmlydHVhbEZzLkhvc3RXYXRjaE9wdGlvbnMsXG4gICk6IE9ic2VydmFibGU8dmlydHVhbEZzLkhvc3RXYXRjaEV2ZW50PiB8IG51bGwge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZTx2aXJ0dWFsRnMuSG9zdFdhdGNoRXZlbnQ+KG9icyA9PiB7XG4gICAgICBjb25zdCB3YXRjaGVyID0gbmV3IEZTV2F0Y2hlcih7IHBlcnNpc3RlbnQ6IHRydWUgfSkuYWRkKHRoaXMuX2dldFN5c3RlbVBhdGgocGF0aCkpO1xuXG4gICAgICB3YXRjaGVyXG4gICAgICAgIC5vbignY2hhbmdlJywgcGF0aCA9PiB7XG4gICAgICAgICAgb2JzLm5leHQoe1xuICAgICAgICAgICAgcGF0aDogbm9ybWFsaXplKHBhdGgpLFxuICAgICAgICAgICAgdGltZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIHR5cGU6IHZpcnR1YWxGcy5Ib3N0V2F0Y2hFdmVudFR5cGUuQ2hhbmdlZCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdhZGQnLCBwYXRoID0+IHtcbiAgICAgICAgICBvYnMubmV4dCh7XG4gICAgICAgICAgICBwYXRoOiBub3JtYWxpemUocGF0aCksXG4gICAgICAgICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgdHlwZTogdmlydHVhbEZzLkhvc3RXYXRjaEV2ZW50VHlwZS5DcmVhdGVkLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAub24oJ3VubGluaycsIHBhdGggPT4ge1xuICAgICAgICAgIG9icy5uZXh0KHtcbiAgICAgICAgICAgIHBhdGg6IG5vcm1hbGl6ZShwYXRoKSxcbiAgICAgICAgICAgIHRpbWU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICB0eXBlOiB2aXJ0dWFsRnMuSG9zdFdhdGNoRXZlbnRUeXBlLkRlbGV0ZWQsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gKCkgPT4gd2F0Y2hlci5jbG9zZSgpO1xuICAgIH0pLnBpcGUoXG4gICAgICBwdWJsaXNoKCksXG4gICAgICByZWZDb3VudCgpLFxuICAgICk7XG4gIH1cbn1cblxuXG4vKipcbiAqIEFuIGltcGxlbWVudGF0aW9uIG9mIHRoZSBWaXJ0dWFsIEZTIHVzaW5nIE5vZGUgYXMgdGhlIGJhY2tlbmQsIHN5bmNocm9ub3VzbHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBOb2RlSnNTeW5jSG9zdCBpbXBsZW1lbnRzIHZpcnR1YWxGcy5Ib3N0PGZzLlN0YXRzPiB7XG4gIHByb3RlY3RlZCBfZ2V0U3lzdGVtUGF0aChwYXRoOiBQYXRoKTogc3RyaW5nIHtcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybS5zdGFydHNXaXRoKCd3aW4zMicpKSB7XG4gICAgICByZXR1cm4gYXNXaW5kb3dzUGF0aChwYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFzUG9zaXhQYXRoKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjYXBhYmlsaXRpZXMoKTogdmlydHVhbEZzLkhvc3RDYXBhYmlsaXRpZXMge1xuICAgIHJldHVybiB7IHN5bmNocm9ub3VzOiB0cnVlIH07XG4gIH1cblxuICB3cml0ZShwYXRoOiBQYXRoLCBjb250ZW50OiB2aXJ0dWFsRnMuRmlsZUJ1ZmZlcik6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIC8vIENyZWF0ZSBmb2xkZXJzIGlmIG5lY2Vzc2FyeS5cbiAgICBjb25zdCBfY3JlYXRlRGlyID0gKHBhdGg6IFBhdGgpID0+IHtcbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKHRoaXMuX2dldFN5c3RlbVBhdGgocGF0aCkpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIF9jcmVhdGVEaXIoZGlybmFtZShwYXRoKSk7XG4gICAgICBmcy5ta2RpclN5bmMocGF0aCk7XG4gICAgfTtcbiAgICBfY3JlYXRlRGlyKGRpcm5hbWUocGF0aCkpO1xuICAgIGZzLndyaXRlRmlsZVN5bmModGhpcy5fZ2V0U3lzdGVtUGF0aChwYXRoKSwgbmV3IFVpbnQ4QXJyYXkoY29udGVudCkpO1xuXG4gICAgcmV0dXJuIGVtcHR5PHZvaWQ+KCk7XG4gIH1cblxuICByZWFkKHBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPHZpcnR1YWxGcy5GaWxlQnVmZmVyPiB7XG4gICAgY29uc3QgYnVmZmVyID0gZnMucmVhZEZpbGVTeW5jKHRoaXMuX2dldFN5c3RlbVBhdGgocGF0aCkpO1xuXG4gICAgcmV0dXJuIG9ic2VydmFibGVPZihuZXcgVWludDhBcnJheShidWZmZXIpLmJ1ZmZlciBhcyB2aXJ0dWFsRnMuRmlsZUJ1ZmZlcik7XG4gIH1cblxuICBkZWxldGUocGF0aDogUGF0aCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIGlmICh0aGlzLmlzRGlyZWN0b3J5KHBhdGgpKSB7XG4gICAgICAvLyBTaW5jZSB0aGlzIGlzIHN5bmNocm9ub3VzLCB3ZSBjYW4gcmVjdXJzZSBhbmQgc2FmZWx5IGlnbm9yZSB0aGUgcmVzdWx0LlxuICAgICAgZm9yIChjb25zdCBuYW1lIG9mIGZzLnJlYWRkaXJTeW5jKHRoaXMuX2dldFN5c3RlbVBhdGgocGF0aCkpKSB7XG4gICAgICAgIHRoaXMuZGVsZXRlKGpvaW4ocGF0aCwgbmFtZSkpO1xuICAgICAgfVxuICAgICAgZnMucm1kaXJTeW5jKHRoaXMuX2dldFN5c3RlbVBhdGgocGF0aCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmcy51bmxpbmtTeW5jKHRoaXMuX2dldFN5c3RlbVBhdGgocGF0aCkpO1xuICAgIH1cblxuICAgIHJldHVybiBlbXB0eSgpO1xuICB9XG5cbiAgcmVuYW1lKGZyb206IFBhdGgsIHRvOiBQYXRoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgZnMucmVuYW1lU3luYyh0aGlzLl9nZXRTeXN0ZW1QYXRoKGZyb20pLCB0aGlzLl9nZXRTeXN0ZW1QYXRoKHRvKSk7XG5cbiAgICByZXR1cm4gZW1wdHkoKTtcbiAgfVxuXG4gIGxpc3QocGF0aDogUGF0aCk6IE9ic2VydmFibGU8UGF0aEZyYWdtZW50W10+IHtcbiAgICByZXR1cm4gb2JzZXJ2YWJsZU9mKGZzLnJlYWRkaXJTeW5jKHRoaXMuX2dldFN5c3RlbVBhdGgocGF0aCkpKS5waXBlKFxuICAgICAgbWFwKG5hbWVzID0+IG5hbWVzLm1hcChuYW1lID0+IGZyYWdtZW50KG5hbWUpKSksXG4gICAgKTtcbiAgfVxuXG4gIGV4aXN0cyhwYXRoOiBQYXRoKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG9ic2VydmFibGVPZihmcy5leGlzdHNTeW5jKHRoaXMuX2dldFN5c3RlbVBhdGgocGF0aCkpKTtcbiAgfVxuXG4gIGlzRGlyZWN0b3J5KHBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm9uLW51bGwtb3BlcmF0b3JcbiAgICByZXR1cm4gdGhpcy5zdGF0cyhwYXRoKSAhLnBpcGUobWFwKHN0YXQgPT4gc3RhdC5pc0RpcmVjdG9yeSgpKSk7XG4gIH1cbiAgaXNGaWxlKHBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm9uLW51bGwtb3BlcmF0b3JcbiAgICByZXR1cm4gdGhpcy5zdGF0cyhwYXRoKSAhLnBpcGUobWFwKHN0YXQgPT4gc3RhdC5pc0ZpbGUoKSkpO1xuICB9XG5cbiAgLy8gU29tZSBob3N0cyBtYXkgbm90IHN1cHBvcnQgc3RhdHMuXG4gIHN0YXRzKHBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPHZpcnR1YWxGcy5TdGF0czxmcy5TdGF0cz4+IHwgbnVsbCB7XG4gICAgcmV0dXJuIG9ic2VydmFibGVPZihmcy5zdGF0U3luYyh0aGlzLl9nZXRTeXN0ZW1QYXRoKHBhdGgpKSk7XG4gIH1cblxuICAvLyBTb21lIGhvc3RzIG1heSBub3Qgc3VwcG9ydCB3YXRjaGluZy5cbiAgd2F0Y2goXG4gICAgcGF0aDogUGF0aCxcbiAgICBfb3B0aW9ucz86IHZpcnR1YWxGcy5Ib3N0V2F0Y2hPcHRpb25zLFxuICApOiBPYnNlcnZhYmxlPHZpcnR1YWxGcy5Ib3N0V2F0Y2hFdmVudD4gfCBudWxsIHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8dmlydHVhbEZzLkhvc3RXYXRjaEV2ZW50PihvYnMgPT4ge1xuICAgICAgY29uc3Qgb3B0cyA9IHsgcGVyc2lzdGVudDogZmFsc2UgfTtcbiAgICAgIGNvbnN0IHdhdGNoZXIgPSBuZXcgRlNXYXRjaGVyKG9wdHMpLmFkZCh0aGlzLl9nZXRTeXN0ZW1QYXRoKHBhdGgpKTtcblxuICAgICAgd2F0Y2hlclxuICAgICAgICAub24oJ2NoYW5nZScsIHBhdGggPT4ge1xuICAgICAgICAgIG9icy5uZXh0KHtcbiAgICAgICAgICAgIHBhdGg6IG5vcm1hbGl6ZShwYXRoKSxcbiAgICAgICAgICAgIHRpbWU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICB0eXBlOiB2aXJ0dWFsRnMuSG9zdFdhdGNoRXZlbnRUeXBlLkNoYW5nZWQsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignYWRkJywgcGF0aCA9PiB7XG4gICAgICAgICAgb2JzLm5leHQoe1xuICAgICAgICAgICAgcGF0aDogbm9ybWFsaXplKHBhdGgpLFxuICAgICAgICAgICAgdGltZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIHR5cGU6IHZpcnR1YWxGcy5Ib3N0V2F0Y2hFdmVudFR5cGUuQ3JlYXRlZCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCd1bmxpbmsnLCBwYXRoID0+IHtcbiAgICAgICAgICBvYnMubmV4dCh7XG4gICAgICAgICAgICBwYXRoOiBub3JtYWxpemUocGF0aCksXG4gICAgICAgICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgdHlwZTogdmlydHVhbEZzLkhvc3RXYXRjaEV2ZW50VHlwZS5EZWxldGVkLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgcmV0dXJuICgpID0+IHdhdGNoZXIuY2xvc2UoKTtcbiAgICB9KS5waXBlKFxuICAgICAgcHVibGlzaCgpLFxuICAgICAgcmVmQ291bnQoKSxcbiAgICApO1xuICB9XG59XG4iXX0=