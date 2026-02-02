import Meta from 'gi://Meta';
import St from 'gi://St';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class WindowDimensionsExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._label = null;
        this._grabOpBeginId = null;
        this._grabOpEndId = null;
        this._sizeChangedId = null;
        this._currentWindow = null;
    }

    enable() {
        // Create a label to display dimensions
        this._label = new St.Label({
            style_class: 'window-dimensions-label',
            style: 'background-color: rgba(0, 0, 0, 0.8); color: white; ' +
                   'font-size: 24px; font-weight: bold; padding: 12px 20px; ' +
                   'border-radius: 8px;',
            text: '',
            visible: false
        });

        // Add label to the UI
        Main.layoutManager.addChrome(this._label, {
            affectsInputRegion: false
        });

        // Connect to window grab events
        let display = global.display;
        
        this._grabOpBeginId = display.connect('grab-op-begin', (display, window, op) => {
            this._onGrabOpBegin(window, op);
        });

        this._grabOpEndId = display.connect('grab-op-end', (display, window, op) => {
            this._onGrabOpEnd(window, op);
        });
    }

    disable() {
        // Disconnect signals
        if (this._grabOpBeginId) {
            global.display.disconnect(this._grabOpBeginId);
            this._grabOpBeginId = null;
        }

        if (this._grabOpEndId) {
            global.display.disconnect(this._grabOpEndId);
            this._grabOpEndId = null;
        }

        if (this._sizeChangedId && this._currentWindow) {
            this._currentWindow.disconnect(this._sizeChangedId);
            this._sizeChangedId = null;
        }

        // Remove and destroy the label
        if (this._label) {
            Main.layoutManager.removeChrome(this._label);
            this._label.destroy();
            this._label = null;
        }

        this._currentWindow = null;
    }

    _onGrabOpBegin(window, op) {
        // Check if this is a resize operation
        if (this._isResizeOp(op)) {
            this._currentWindow = window;
            
            // Connect to size-changed signal
            this._sizeChangedId = window.connect('size-changed', () => {
                this._updateDimensions(window);
            });

            // Show initial dimensions
            this._updateDimensions(window);
            this._label.visible = true;
        }
    }

    _onGrabOpEnd(window, op) {
        // Check if this was a resize operation
        if (this._isResizeOp(op)) {
            // Hide the label
            this._label.visible = false;

            // Disconnect size-changed signal
            if (this._sizeChangedId && this._currentWindow) {
                this._currentWindow.disconnect(this._sizeChangedId);
                this._sizeChangedId = null;
            }

            this._currentWindow = null;
        }
    }

    _isResizeOp(op) {
        // Check if the operation is a resize
        return op === Meta.GrabOp.RESIZING_E ||
               op === Meta.GrabOp.RESIZING_W ||
               op === Meta.GrabOp.RESIZING_N ||
               op === Meta.GrabOp.RESIZING_S ||
               op === Meta.GrabOp.RESIZING_NE ||
               op === Meta.GrabOp.RESIZING_NW ||
               op === Meta.GrabOp.RESIZING_SE ||
               op === Meta.GrabOp.RESIZING_SW ||
               op === Meta.GrabOp.KEYBOARD_RESIZING_UNKNOWN ||
               op === Meta.GrabOp.KEYBOARD_RESIZING_N ||
               op === Meta.GrabOp.KEYBOARD_RESIZING_S ||
               op === Meta.GrabOp.KEYBOARD_RESIZING_W ||
               op === Meta.GrabOp.KEYBOARD_RESIZING_E ||
               op === Meta.GrabOp.KEYBOARD_RESIZING_NW ||
               op === Meta.GrabOp.KEYBOARD_RESIZING_NE ||
               op === Meta.GrabOp.KEYBOARD_RESIZING_SW ||
               op === Meta.GrabOp.KEYBOARD_RESIZING_SE;
    }

    _updateDimensions(window) {
        let rect = window.get_frame_rect();
        let width = rect.width;
        let height = rect.height;

        // Update label text
        this._label.text = `${width} × ${height}`;

        // Position the label at the center of the window being resized
        let labelWidth = this._label.width;
        let labelHeight = this._label.height;

        this._label.set_position(
            rect.x + Math.floor((rect.width - labelWidth) / 2),
            rect.y + Math.floor((rect.height - labelHeight) / 2)
        );
    }
}
