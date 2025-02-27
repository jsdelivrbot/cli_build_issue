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
class InMemoryFileSystemTreeHost {
    constructor(content) {
        this._content = Object.create(null);
        Object.keys(content).forEach(path => {
            path = core_1.normalize(path);
            this._content[path] = new Buffer(content[path]);
        });
        this._files = Object.keys(this._content);
    }
    listDirectory(path) {
        path = core_1.normalize(path).replace(/\/?$/, '/');
        return Object.keys(this._files
            .filter(p => p.startsWith(path))
            .map(p => p.substr(path.length))
            .map(p => p.replace(/\/.*$/, ''))
            .reduce((acc, p) => (acc[p] = true, acc), {})).sort();
    }
    isDirectory(path) {
        path = core_1.normalize(path);
        return path == '/' || this._files.some(p => p.split('/').slice(0, -1).join('/') == path);
    }
    readFile(path) {
        path = core_1.normalize(path);
        return this._content[path] || new Buffer('');
    }
    exists(path) {
        path = core_1.normalize(path);
        return this._content[path] != undefined;
    }
    join(path1, path2) {
        return core_1.normalize(path1 + '/' + path2);
    }
}
exports.InMemoryFileSystemTreeHost = InMemoryFileSystemTreeHost;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtb3J5LWhvc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2hhbnNsL1NvdXJjZXMvaGFuc2wvZGV2a2l0LyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvc2NoZW1hdGljcy9zcmMvdHJlZS9tZW1vcnktaG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtDQUFpRDtBQUlqRDtJQUdFLFlBQVksT0FBbUM7UUFDN0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2xDLElBQUksR0FBRyxnQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxhQUFhLENBQUMsSUFBWTtRQUN4QixJQUFJLEdBQUcsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTVDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNoQixJQUFJLENBQUMsTUFBTTthQUNSLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDL0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDL0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDaEMsTUFBTSxDQUFDLENBQUMsR0FBMkIsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDeEUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNYLENBQUM7SUFDRCxXQUFXLENBQUMsSUFBWTtRQUN0QixJQUFJLEdBQUcsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV2QixNQUFNLENBQUMsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUMzRixDQUFDO0lBQ0QsUUFBUSxDQUFDLElBQVk7UUFDbkIsSUFBSSxHQUFHLGdCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUNELE1BQU0sQ0FBQyxJQUFZO1FBQ2pCLElBQUksR0FBRyxnQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLFNBQVMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsSUFBSSxDQUFDLEtBQWEsRUFBRSxLQUFhO1FBQy9CLE1BQU0sQ0FBQyxnQkFBUyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDeEMsQ0FBQztDQUNGO0FBMUNELGdFQTBDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IG5vcm1hbGl6ZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IEZpbGVTeXN0ZW1UcmVlSG9zdCB9IGZyb20gJy4vZmlsZXN5c3RlbSc7XG5cblxuZXhwb3J0IGNsYXNzIEluTWVtb3J5RmlsZVN5c3RlbVRyZWVIb3N0IGltcGxlbWVudHMgRmlsZVN5c3RlbVRyZWVIb3N0IHtcbiAgcHJpdmF0ZSBfY29udGVudDogeyBbcGF0aDogc3RyaW5nXTogQnVmZmVyIH07XG4gIHByaXZhdGUgX2ZpbGVzOiBzdHJpbmdbXTtcbiAgY29uc3RydWN0b3IoY29udGVudDogeyBbcGF0aDogc3RyaW5nXTogc3RyaW5nIH0pIHtcbiAgICB0aGlzLl9jb250ZW50ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBPYmplY3Qua2V5cyhjb250ZW50KS5mb3JFYWNoKHBhdGggPT4ge1xuICAgICAgcGF0aCA9IG5vcm1hbGl6ZShwYXRoKTtcbiAgICAgIHRoaXMuX2NvbnRlbnRbcGF0aF0gPSBuZXcgQnVmZmVyKGNvbnRlbnRbcGF0aF0pO1xuICAgIH0pO1xuICAgIHRoaXMuX2ZpbGVzID0gT2JqZWN0LmtleXModGhpcy5fY29udGVudCk7XG4gIH1cblxuICBsaXN0RGlyZWN0b3J5KHBhdGg6IHN0cmluZykge1xuICAgIHBhdGggPSBub3JtYWxpemUocGF0aCkucmVwbGFjZSgvXFwvPyQvLCAnLycpO1xuXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKFxuICAgICAgdGhpcy5fZmlsZXNcbiAgICAgICAgLmZpbHRlcihwID0+IHAuc3RhcnRzV2l0aChwYXRoKSlcbiAgICAgICAgLm1hcChwID0+IHAuc3Vic3RyKHBhdGgubGVuZ3RoKSlcbiAgICAgICAgLm1hcChwID0+IHAucmVwbGFjZSgvXFwvLiokLywgJycpKVxuICAgICAgICAucmVkdWNlKChhY2M6IHtbazogc3RyaW5nXTogYm9vbGVhbn0sIHApID0+IChhY2NbcF0gPSB0cnVlLCBhY2MpLCB7fSksXG4gICAgKS5zb3J0KCk7XG4gIH1cbiAgaXNEaXJlY3RvcnkocGF0aDogc3RyaW5nKSB7XG4gICAgcGF0aCA9IG5vcm1hbGl6ZShwYXRoKTtcblxuICAgIHJldHVybiBwYXRoID09ICcvJyB8fCB0aGlzLl9maWxlcy5zb21lKHAgPT4gcC5zcGxpdCgnLycpLnNsaWNlKDAsIC0xKS5qb2luKCcvJykgPT0gcGF0aCk7XG4gIH1cbiAgcmVhZEZpbGUocGF0aDogc3RyaW5nKSB7XG4gICAgcGF0aCA9IG5vcm1hbGl6ZShwYXRoKTtcblxuICAgIHJldHVybiB0aGlzLl9jb250ZW50W3BhdGhdIHx8IG5ldyBCdWZmZXIoJycpO1xuICB9XG4gIGV4aXN0cyhwYXRoOiBzdHJpbmcpIHtcbiAgICBwYXRoID0gbm9ybWFsaXplKHBhdGgpO1xuXG4gICAgcmV0dXJuIHRoaXMuX2NvbnRlbnRbcGF0aF0gIT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgam9pbihwYXRoMTogc3RyaW5nLCBwYXRoMjogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZShwYXRoMSArICcvJyArIHBhdGgyKTtcbiAgfVxufVxuIl19