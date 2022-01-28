# apps
How to build Shu app files

## types
There are two types of apps for ShuOS. They are `inset` and `iframe`. They are all html files.

In an `inset` app, you should only write html nodes inside `<body>` in a html file. Everything in the file will be **copied** to the context in the main window. So every global variables and functions can be used freely. If you are trying to link from a foreign file to the html, try to make the path correct and do not use cors.

In an `iframe` app, you need to write a complete html file including `<head>` and `<body>`. This file will be **referenced** with `<iframe>`. So a foreign html file or url is available. But **take care of origin** problem!

### `inset`
Reference [main.js](../main.js) to use and change global variables and functions. `Inset` apps have supreme permissions to the ShuOS.
***

### `iframe`
If your app file is in the same [origin](https://developer.mozilla.org/docs/Web/HTTP/Headers/Origin), you may use global variables by using `parent`. Or they will be prevented by the browser.
***

### some useful variables
You may use them to make your apps more seamless in ShuOS.

*`[parent.]` means you can use `parent` prefix to use global variables in iframe.

`[parent.]globalTheme`:
Returns global theme object.

`[parent.]globalTheme.status`:
String that reflects current theme status.

`[parent.]globalTheme.change(dest)`: change current theme. If `dest` is not defined, it runs automatically. `dest` should be in `'dark'` or `'light'`

For more, see [main.js](../main.js). 
