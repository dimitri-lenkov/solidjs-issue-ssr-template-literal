solidjs-issue-ssr-template-literal
========================================================================

This is a bug, I think, in Solid-JS. SSR renders what I expect, but
after hiding & re-rendering the view with JavaScript, the output is
wrong.

```
npm install
node server
```

1. Open in the browser *with javascript enabled* and see:

```
 _____________
< Hello World >
 -------------
       \   ,__,
        \  (^^)____
           (__)    )\
              ||--|| *
```


2. Toggle the visible checkbox off/on, and see that the output is now like this:

```
 _____________
< Hello World >
 -------------
          ,__,
          (^^)____
           (__)    )              ||--|| *
```
