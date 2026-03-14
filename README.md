# Tag Atlas　（tag-atlas v0.1)

tag-atlas is a simple desktop tool that adds tags to files and folders.

It stores a small SQLite database inside a selected root folder and lets you quickly search files by tags.

The goal is to make large collections of files easier to navigate.


# Features

Select a root folder

A SQLite database is created inside the root

Drag & drop files or folders to add tags

Search files by tag

Open the file location in Finder / Explorer

# How it works

tag-atlas keeps a small SQLite database in the root folder.

```
Example structure:

root-folder/
.tag-atlas.db
manga/
images/
videos/
```

Each file or folder can have multiple tags.

# Example:

```
path: manga/onepiece.zip
tag: manga

path: manga/onepiece.zip
tag: shonen

path: images/cat.png
tag: animal
```

You can then search by tag and quickly locate files.

# Why this tool?

Modern operating systems provide file search, but they usually lack simple multi-tag management.

tag-atlas focuses on:

```
simplicity

local storage

portable databases

no cloud dependency

Your data stays inside your folder.

Version 0.1

Initial prototype.
```


# Implemented:

```
root folder selection

SQLite workspace database

drag & drop tagging

tag search

open location in file manager
```

# Future ideas

```
Tag editing dialog

Media / comic viewer

Faster search

Tag suggestions

Bulk tagging
```
