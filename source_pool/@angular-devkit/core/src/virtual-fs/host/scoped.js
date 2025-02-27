"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("../path");
class ScopedHost {
    constructor(_delegate, _root = path_1.NormalizedRoot) {
        this._delegate = _delegate;
        this._root = _root;
    }
    get capabilities() { return this._delegate.capabilities; }
    write(path, content) {
        return this._delegate.write(path_1.join(this._root, path), content);
    }
    read(path) {
        return this._delegate.read(path_1.join(this._root, path));
    }
    delete(path) {
        return this._delegate.delete(path_1.join(this._root, path));
    }
    rename(from, to) {
        return this._delegate.rename(path_1.join(this._root, from), path_1.join(this._root, to));
    }
    list(path) {
        return this._delegate.list(path_1.join(this._root, path));
    }
    exists(path) {
        return this._delegate.exists(path_1.join(this._root, path));
    }
    isDirectory(path) {
        return this._delegate.isDirectory(path_1.join(this._root, path));
    }
    isFile(path) {
        return this._delegate.isFile(path_1.join(this._root, path));
    }
    // Some hosts may not support stats.
    stats(path) {
        return this._delegate.stats(path_1.join(this._root, path));
    }
    // Some hosts may not support watching.
    watch(path, options) {
        return this._delegate.watch(path_1.join(this._root, path), options);
    }
}
exports.ScopedHost = ScopedHost;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGVkLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9oYW5zbC9Tb3VyY2VzL2hhbnNsL2RldmtpdC8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2NvcmUvc3JjL3ZpcnR1YWwtZnMvaG9zdC9zY29wZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFRQSxrQ0FBbUU7QUFVbkU7SUFDRSxZQUFzQixTQUFrQixFQUFZLFFBQWMscUJBQWM7UUFBMUQsY0FBUyxHQUFULFNBQVMsQ0FBUztRQUFZLFVBQUssR0FBTCxLQUFLLENBQXVCO0lBQUcsQ0FBQztJQUVwRixJQUFJLFlBQVksS0FBdUIsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztJQUU1RSxLQUFLLENBQUMsSUFBVSxFQUFFLE9BQW1CO1FBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxXQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBQ0QsSUFBSSxDQUFDLElBQVU7UUFDYixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBQ0QsTUFBTSxDQUFDLElBQVU7UUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBQ0QsTUFBTSxDQUFDLElBQVUsRUFBRSxFQUFRO1FBQ3pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFFRCxJQUFJLENBQUMsSUFBVTtRQUNiLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCxNQUFNLENBQUMsSUFBVTtRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFDRCxXQUFXLENBQUMsSUFBVTtRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsV0FBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBQ0QsTUFBTSxDQUFDLElBQVU7UUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQsb0NBQW9DO0lBQ3BDLEtBQUssQ0FBQyxJQUFVO1FBQ2QsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFdBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELHVDQUF1QztJQUN2QyxLQUFLLENBQUMsSUFBVSxFQUFFLE9BQTBCO1FBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxXQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMvRCxDQUFDO0NBQ0Y7QUF6Q0QsZ0NBeUNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMvT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBOb3JtYWxpemVkUm9vdCwgUGF0aCwgUGF0aEZyYWdtZW50LCBqb2luIH0gZnJvbSAnLi4vcGF0aCc7XG5pbXBvcnQge1xuICBGaWxlQnVmZmVyLFxuICBIb3N0LFxuICBIb3N0Q2FwYWJpbGl0aWVzLFxuICBIb3N0V2F0Y2hFdmVudCxcbiAgSG9zdFdhdGNoT3B0aW9ucyxcbiAgU3RhdHMsXG59IGZyb20gJy4vaW50ZXJmYWNlJztcblxuZXhwb3J0IGNsYXNzIFNjb3BlZEhvc3Q8VCBleHRlbmRzIG9iamVjdD4gaW1wbGVtZW50cyBIb3N0PFQ+IHtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIF9kZWxlZ2F0ZTogSG9zdDxUPiwgcHJvdGVjdGVkIF9yb290OiBQYXRoID0gTm9ybWFsaXplZFJvb3QpIHt9XG5cbiAgZ2V0IGNhcGFiaWxpdGllcygpOiBIb3N0Q2FwYWJpbGl0aWVzIHsgcmV0dXJuIHRoaXMuX2RlbGVnYXRlLmNhcGFiaWxpdGllczsgfVxuXG4gIHdyaXRlKHBhdGg6IFBhdGgsIGNvbnRlbnQ6IEZpbGVCdWZmZXIpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUud3JpdGUoam9pbih0aGlzLl9yb290LCBwYXRoKSwgY29udGVudCk7XG4gIH1cbiAgcmVhZChwYXRoOiBQYXRoKTogT2JzZXJ2YWJsZTxGaWxlQnVmZmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RlbGVnYXRlLnJlYWQoam9pbih0aGlzLl9yb290LCBwYXRoKSk7XG4gIH1cbiAgZGVsZXRlKHBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuZGVsZXRlKGpvaW4odGhpcy5fcm9vdCwgcGF0aCkpO1xuICB9XG4gIHJlbmFtZShmcm9tOiBQYXRoLCB0bzogUGF0aCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9kZWxlZ2F0ZS5yZW5hbWUoam9pbih0aGlzLl9yb290LCBmcm9tKSwgam9pbih0aGlzLl9yb290LCB0bykpO1xuICB9XG5cbiAgbGlzdChwYXRoOiBQYXRoKTogT2JzZXJ2YWJsZTxQYXRoRnJhZ21lbnRbXT4ge1xuICAgIHJldHVybiB0aGlzLl9kZWxlZ2F0ZS5saXN0KGpvaW4odGhpcy5fcm9vdCwgcGF0aCkpO1xuICB9XG5cbiAgZXhpc3RzKHBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuZXhpc3RzKGpvaW4odGhpcy5fcm9vdCwgcGF0aCkpO1xuICB9XG4gIGlzRGlyZWN0b3J5KHBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuaXNEaXJlY3Rvcnkoam9pbih0aGlzLl9yb290LCBwYXRoKSk7XG4gIH1cbiAgaXNGaWxlKHBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuaXNGaWxlKGpvaW4odGhpcy5fcm9vdCwgcGF0aCkpO1xuICB9XG5cbiAgLy8gU29tZSBob3N0cyBtYXkgbm90IHN1cHBvcnQgc3RhdHMuXG4gIHN0YXRzKHBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPFN0YXRzPFQ+PiB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9kZWxlZ2F0ZS5zdGF0cyhqb2luKHRoaXMuX3Jvb3QsIHBhdGgpKTtcbiAgfVxuXG4gIC8vIFNvbWUgaG9zdHMgbWF5IG5vdCBzdXBwb3J0IHdhdGNoaW5nLlxuICB3YXRjaChwYXRoOiBQYXRoLCBvcHRpb25zPzogSG9zdFdhdGNoT3B0aW9ucyk6IE9ic2VydmFibGU8SG9zdFdhdGNoRXZlbnQ+IHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2RlbGVnYXRlLndhdGNoKGpvaW4odGhpcy5fcm9vdCwgcGF0aCksIG9wdGlvbnMpO1xuICB9XG59XG4iXX0=