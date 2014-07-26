/**
 * Copyright (C) 2012-2014 Marcus Habermehl <bmh1980@posteo.org>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301,
 * USA.
*/

// External imports
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

// Internal imports
const Shell = imports.gi.Shell;

const appSystem = Shell.AppSystem.get_default();

function getBookmarks() {
    let bookmarks = [];

    let appInfos = appSystem.initial_search(['opera']);

    if (appInfos.length == 0) {
        return bookmarks;
    }

    let appInfo = appInfos[0].get_app_info();
    let file = Gio.File.new_for_path(GLib.build_filenamev(
        [GLib.get_home_dir(), '.opera', 'bookmarks.adr']));

    if (! file.query_exists(null)) {
        return bookmarks;
    }

    let success, content, size;

    try {
        [success, content, size] = file.load_contents(null);
    } catch(e) {
        logError(e);
        return bookmarks;
    }

    if (success) {
        let contentStr = new String(content);
        let lines = contentStr.split('\n');

        let isUri = false;
        let title = null;
        let uri = null;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            if (line == "#URL") {
                isUri = true;
            } else if (isUri) {
                if (line.indexOf("NAME=") == 0) {
                    title = line.split("NAME=")[1];
                } else if (line.indexOf("URL=") == 0) {
                    uri = line.split("URL=")[1];
                } else if (line == "") {
                    bookmarks.push({
                        appInfo: appInfo,
                        name: title,
                        score: 0,
                        uri: url
                    });
                    isUri = false;
                    title = null;
                    uri = null;
                }
            }
        }
    }

    return bookmarks;
}
