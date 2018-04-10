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

1. <s>Settings</s> -  done!
2. Support for nested regions

## Release Notes

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