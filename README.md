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

Customize your regions by providing a `rgba(r, g, b, a)` color, or create a custom `named color` in **user settings** or **package.json** (workspace) and use it.

Define `coloredRegions.colorRange` array and use `#region` without explicit color definition.

![features](images/features.png)

## Settings

Settings will be read from (listed by priority):

1) package.json (workspace)

![package settings](images/package_settings.png)

2) user settings

![user settings](images/user_settings.png)

## Example

![regions example](images/regions.png)

## Roadmap

1. Minimap support

## Release Notes

### 0.0.4
* Code refactoring and performance optimization.

* No glitchy backgrounds while typing inside the region, only the meaningful changes are sent to the editor.

* Added support for nested regions.

* Added support for Lua `--region` and `--[[ region ]]` comments.

* Added support for regions without explicit color and name: the values are taken from the `coloredRegions.colorRange` array.

* Added support for colors in `#region[#ddd]` and `#region[#dddddd50]` formats.

* If no last `#end region` is set, the last region extends to the end of the file.

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
