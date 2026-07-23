"""
ast_analyzer.py
---------------
Uses Python's built-in `ast` module to pull structure/quality signals
from .py files: function/class counts, docstring coverage, import list,
and a rough complexity proxy (count of branching nodes per function).

This covers Python out of the box. Tree-sitter (multi-language) is a
nice-to-have layer on top for JS/TS/Java/etc — stubbed at the bottom
so you can slot it in later without changing the calling code.
"""

import ast


def analyze_python_file(source: str, path: str) -> dict:
    """Returns structure/quality signals for one Python file's source."""
    try:
        tree = ast.parse(source, filename=path)
    except SyntaxError as e:
        return {"path": path, "parse_error": str(e)}

    functions, classes, imports = [], [], []

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            branch_nodes = sum(
                1 for n in ast.walk(node)
                if isinstance(n, (ast.If, ast.For, ast.While, ast.Try, ast.With))
            )
            functions.append({
                "name": node.name,
                "line": node.lineno,
                "has_docstring": ast.get_docstring(node) is not None,
                "arg_count": len(node.args.args),
                "complexity_proxy": branch_nodes + 1,  # +1 base path
            })
        elif isinstance(node, ast.ClassDef):
            classes.append({
                "name": node.name,
                "line": node.lineno,
                "has_docstring": ast.get_docstring(node) is not None,
                "method_count": sum(1 for n in node.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))),
            })
        elif isinstance(node, ast.Import):
            imports.extend(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.append(node.module)

    documented = sum(1 for f in functions if f["has_docstring"]) + sum(1 for c in classes if c["has_docstring"])
    total_definitions = len(functions) + len(classes)
    doc_coverage = round(100 * documented / total_definitions) if total_definitions else None

    return {
        "path": path,
        "module_docstring": ast.get_docstring(tree) is not None,
        "function_count": len(functions),
        "class_count": len(classes),
        "functions": functions,
        "classes": classes,
        "imports": sorted(set(imports)),
        "docstring_coverage_pct": doc_coverage,
    }


def analyze_project(root_dir: str, tree: list[dict], read_file_fn, max_files: int = 200) -> dict:
    """
    Runs analyze_python_file over every .py file in the tree (capped at
    max_files to keep this fast for huge repos), and rolls it up.
    """
    py_paths = [item["path"] for item in tree if item["path"].endswith(".py")][:max_files]

    file_results = []
    total_functions = total_classes = 0
    doc_scores = []

    for rel_path in py_paths:
        content = read_file_fn(rel_path)
        if content is None:
            continue
        result = analyze_python_file(content, rel_path)
        file_results.append(result)
        if "parse_error" not in result:
            total_functions += result["function_count"]
            total_classes += result["class_count"]
            if result["docstring_coverage_pct"] is not None:
                doc_scores.append(result["docstring_coverage_pct"])

    return {
        "python_files_analyzed": len(file_results),
        "total_functions": total_functions,
        "total_classes": total_classes,
        "avg_docstring_coverage_pct": round(sum(doc_scores) / len(doc_scores)) if doc_scores else None,
        "files": file_results,
    }


# --- Tree-sitter stub (nice-to-have, add once Python path is solid) ---
def analyze_with_tree_sitter(source: str, language: str) -> dict:
    """
    Placeholder for multi-language support (JS/TS/Java/Go/etc).
    Install: pip install tree-sitter tree-sitter-languages
    Usage sketch:
        from tree_sitter_languages import get_parser
        parser = get_parser(language)  # e.g. "javascript"
        tree = parser.parse(bytes(source, "utf8"))
        # walk tree.root_node similarly to the ast.walk() above
    Left unimplemented for Week 1 — Python AST already covers your
    most common capstone submissions.
    """
    raise NotImplementedError("Add in a later week once Python path is validated")


if __name__ == "__main__":
    sample = '''
"""Module docstring."""
import os
from flask import Flask

class Greeter:
    """Says hello."""
    def greet(self, name):
        if name:
            return f"Hello {name}"
        return "Hello stranger"

def undocumented_func(a, b, c):
    for i in range(a):
        if i == b:
            return c
    return None
'''
    result = analyze_python_file(sample, "sample.py")
    import json
    print(json.dumps(result, indent=2))
