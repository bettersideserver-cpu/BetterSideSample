Pannellum 2.5.6 local modification:

The touch-move handler checks `touchZoom !== false` before applying pinch zoom.
Set `touchZoom: false` in the viewer configuration to disable pinch zoom while
preserving touch panning. Both touch events and the library's pointer-event
fallback use this handler. This option is a local extension, not an upstream API.
Preserve this change when replacing the bundled library.
