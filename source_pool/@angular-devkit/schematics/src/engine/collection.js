"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CollectionImpl {
    constructor(_description, _engine) {
        this._description = _description;
        this._engine = _engine;
    }
    get description() { return this._description; }
    get name() { return this.description.name || '<unknown>'; }
    createSchematic(name) {
        return this._engine.createSchematic(name, this);
    }
    listSchematicNames() {
        return this._engine.listSchematicNames(this);
    }
}
exports.CollectionImpl = CollectionImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvaGFuc2wvU291cmNlcy9oYW5zbC9kZXZraXQvIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9zY2hlbWF0aWNzL3NyYy9lbmdpbmUvY29sbGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVdBO0lBRUUsWUFBb0IsWUFBZ0QsRUFDaEQsT0FBaUQ7UUFEakQsaUJBQVksR0FBWixZQUFZLENBQW9DO1FBQ2hELFlBQU8sR0FBUCxPQUFPLENBQTBDO0lBQ3JFLENBQUM7SUFFRCxJQUFJLFdBQVcsS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDL0MsSUFBSSxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFFM0QsZUFBZSxDQUFDLElBQVk7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsa0JBQWtCO1FBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9DLENBQUM7Q0FDRjtBQWhCRCx3Q0FnQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBTY2hlbWF0aWNFbmdpbmUgfSBmcm9tICcuL2VuZ2luZSc7XG5pbXBvcnQgeyBDb2xsZWN0aW9uLCBDb2xsZWN0aW9uRGVzY3JpcHRpb24sIFNjaGVtYXRpYyB9IGZyb20gJy4vaW50ZXJmYWNlJztcblxuXG5leHBvcnQgY2xhc3MgQ29sbGVjdGlvbkltcGw8Q29sbGVjdGlvblQgZXh0ZW5kcyBvYmplY3QsIFNjaGVtYXRpY1QgZXh0ZW5kcyBvYmplY3Q+XG4gICAgaW1wbGVtZW50cyBDb2xsZWN0aW9uPENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2Rlc2NyaXB0aW9uOiBDb2xsZWN0aW9uRGVzY3JpcHRpb248Q29sbGVjdGlvblQ+LFxuICAgICAgICAgICAgICBwcml2YXRlIF9lbmdpbmU6IFNjaGVtYXRpY0VuZ2luZTxDb2xsZWN0aW9uVCwgU2NoZW1hdGljVD4pIHtcbiAgfVxuXG4gIGdldCBkZXNjcmlwdGlvbigpIHsgcmV0dXJuIHRoaXMuX2Rlc2NyaXB0aW9uOyB9XG4gIGdldCBuYW1lKCkgeyByZXR1cm4gdGhpcy5kZXNjcmlwdGlvbi5uYW1lIHx8ICc8dW5rbm93bj4nOyB9XG5cbiAgY3JlYXRlU2NoZW1hdGljKG5hbWU6IHN0cmluZyk6IFNjaGVtYXRpYzxDb2xsZWN0aW9uVCwgU2NoZW1hdGljVD4ge1xuICAgIHJldHVybiB0aGlzLl9lbmdpbmUuY3JlYXRlU2NoZW1hdGljKG5hbWUsIHRoaXMpO1xuICB9XG5cbiAgbGlzdFNjaGVtYXRpY05hbWVzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5fZW5naW5lLmxpc3RTY2hlbWF0aWNOYW1lcyh0aGlzKTtcbiAgfVxufVxuIl19