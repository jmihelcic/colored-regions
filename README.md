# Colored Regions for Visual Studio Code

This package provides a simple way of colorizing regions.

## Installation

Install through VS Code extensions. Search for `Colored Regions`

[Visual Studio Code Market Place: Colored Regions](https://marketplace.visualstudio.com/items?itemName=mihelcic.colored-regions)

Can also be installed using:

```
ext install colored-regions
```

## Features

Customize your regions by providing a `rgba(r,g,b,a)`, `rgb(r,g,b)` or `#hex` color, or create a custom `named color` in **user settings** or **package.json** (workspace) and use it.

Define `coloredRegions.colorRange` array and use `#region` without explicit color definition.

![features](images/features.png)

## Settings

Settings will be read from (listed by priority):

1) package.json (workspace)

![package settings](images/package_settings.png)

2) user settings

![user settings](images/user_settings.png)

3) default settings

By default the `colorRange` has 6 elements, the colors taken from material palette with 0.12 opacity

## Example

![regions example](images/regions.png)

## Roadmap

1. Minimap support

## Release Notes

### 0.0.5

* Region start regex power decreased, just a `region` or `pragma region` word does not start the region.
To start the region the line must start with one of `#`, `//#`, `#pragma` `//`, `--`, `--[[`, `'''`, or `<!--` expression followed with the `region` word.


### 0.0.4

* Code refactoring and performance optimization.

* No glitchy backgrounds while typing inside the region, only the meaningful changes are sent to the editor.

* Added support for nested regions.

* Added support for Lua `--region` and `--[[ region ]]` comments.

* Added support for `/* region ` and ` end region */` multi-line JavaScript/TypeScript/C# comments.

* Added support for `''' region` Python multi-line comments.

* Added support for HEX colors in `#region[#123]`, `#region[#123456]` and `#region[#12345678]` formats.

* Added support for flexible color declarations: `#region Sample Comment [#ddd]` is supported.

* Added support for regions without a color declaration: the values are taken from the `coloredRegions.colorRange` array.

* If the color param is not defined or is invalid, region color fallbacks to the next value from `coloredRegions.colorRange` array.

* If no last `#end region` is set, the last region extends to the end of the file.

* Added support for multiple editor windows/split view/the same document in different windows.

* Multiple color declarations are supported: the first valid is taken: `#region [main] [#ddd]` sets color to the `main` if the last is defined. Otherwise it fallbacks to `[#ddd]`.


### 0.0.3

* Added support for named colors

![named colors](images/named_colors.png)

* Named colors defined in **package.json** (workspace)

![package settings](images/package_settings.png)

* Named colors defined in **user settings**

![user settings](images/user_settings.png)


### 0.0.2

* Added support for more languages

![supported regions](images/supported_regions.png)


### 0.0.1

* MVP release
