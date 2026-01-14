import Adw from 'gi://Adw';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class WindowDimensionsPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: 'About',
            description: 'Window Dimensions Extension'
        });
        page.add(group);

        const aboutRow = new Adw.ActionRow({
            title: 'Window Dimensions',
            subtitle: 'Shows window dimensions while resizing'
        });
        group.add(aboutRow);

        const infoRow = new Adw.ActionRow({
            title: 'How to use',
            subtitle: 'Simply resize any window and the dimensions will appear in the center'
        });
        group.add(infoRow);

        window.add(page);
    }
}
