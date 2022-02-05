# apps
How to build Shu app files

## types
There are two types of apps for ShuOS. They are `inset` and `iframe`. They are all html files.

`inset` apps are usually used for internal and useful tools, they are in the supreme environment so their styles will mix with the OS. Their scripts will also run, but they cannot make effect to the global document, so js frames is inavailable. `iframe` apps can be used to develop anything you want, but they have limits to contact with the OS.

In an `inset` app, you should only write html nodes inside `<body>` in a html file. Everything in the file will be **copied** to the context in the main window. So every global variables, functions and APIs can be used freely. But you might need more experirences and experiments about `inset` app development, because **all `inset` apps use the same environment with the ShuOS**. If you are trying to link from a foreign file to the html, you might not succeed.

In an `iframe` app, you need to write a complete html file including `<head>` and `<body>`. This file will be **referenced** with `<iframe>`. So a foreign html file or url is available. But **take care of origin** problem! What's more, iframe is departed from the main document, so **almost all events defined in the ShuOS cannot be active in `iframe` contents**.
***

### `inset`
Reference [main.js](../main.js) to use global variables functions and APIs, `body` in [main.css](../main.css) to see color variables. `Inset` apps have supreme permissions to the ShuOS.
There are two variables to use to get the app status - `appbody` and `appproc`. When developping, try using `console.log(appbody, appproc)` to see what they are.
***

### `iframe`
If your app file is in the same [origin](https://developer.mozilla.org/docs/Web/HTTP/Headers/Origin), you may use global variables by using `parent`. Or they will be prevented by the browser. 
***

## APIs
You may use them to make your apps more seamless in ShuOS.

*`[parent.]` means you can use `parent` prefix to use global variables in iframe if your file is in the same origin.

`[parent.]globalTheme`:
Returns global theme object.

`[parent.]globalTheme.status`:
String that reflects current theme status.

`[parent.]globalTheme.change(dest)`: change current theme. If `dest` is not defined, it runs automatically. `dest` should be in `'dark'` or `'light'`

`const anEvent = new [parent.]ShuEvent('appOpen', ()=>{...})`: bind an event from ShuEvents to the function.

For more, see [main.js](../main.js). 
