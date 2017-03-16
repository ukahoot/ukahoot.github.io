class Theme {
    constructor(saveObject) {
        // bg is background color, br is border color
        if (saveObject) {
            this.bg = saveObject.bg;
            this.br = saveObject.br;
        } else {
            this.bg = null;
            this.br = null;
        }
    }
    save() {
        if (localStorage[Theme.STORAGE_KEY]) {
            // There are no themes in localStorage, it is safe to write to
            var saveObject = this.getSaveObject();
            localStorage[Theme.STORAGE_KEY] = [saveObject];
        } else {
            var oldThemes = null;
            try {
                oldThemes = JSON.parse(localStorage[Theme.STORAGE_KEY]);
            } catch (e) {
                ukahoot.interface.showAlert('There was an error saving the theme!');
                console.error('There was an error parsing localStorage JSON:', e);
            }
            if (oldThemes) {
                // TODO: append this theme to localStoage
            }
        }
    }
    getSaveObject() {
        return {
            'bg': this.bg,
            'br': this.br
        }
    }
}
Theme.STORAGE_KEY = 'themes';
class ThemeEditor {
    constructor(elem) {
        if (!elem) throw new Error("ThemeEditor needs a container element!");
        this.elm = elem;
    }
}