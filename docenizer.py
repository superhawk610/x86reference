#! /usr/bin/env python3

# Copyright (c) 2012-2019, Compiler Explorer Authors
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
#     * Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
# SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.

import argparse
import json
import os
import pprint
import re
import sys
import tarfile
import urllib
from urllib import parse, request

try:
    from bs4 import BeautifulSoup
except ImportError:
    raise ImportError(
        "Please install BeautifulSoup (apt-get install python3-bs4 or pip install beautifulsoup4 should do it)"
    )

parser = argparse.ArgumentParser(
    description="Docenizes HTML version of the official Intel Asm PDFs"
)
parser.add_argument(
    "-i",
    "--inputfolder",
    type=str,
    help="Folder where the input files reside as .html. Default is ./asm-docs/",
    default="asm-docs",
)
parser.add_argument(
    "-o",
    "--outputdir",
    type=str,
    help="Output directory for the generated JSON files. Default is ./",
    default="./",
)
parser.add_argument(
    "-d",
    "--downloadfolder",
    type=str,
    help="Folder where the archive will be downloaded and extracted",
    default="asm-docs",
)

# The maximum number of paragraphs from the description to copy.
MAX_DESC_PARAS = 25
STRIP_PREFIX = re.compile(
    r"^(([0-9a-fA-F]{2}|m64|NP|(REX|E?VEX\.)[.0-9A-Z]*|/[0-9a-z]+|[a-z]+)\b\s*)*"
)
INSTRUCTION_RE = re.compile(r"^([A-Z][A-Z0-9]+)\*?(\s+|$)")
# Some instructions are so broken we just take their names from the filename
UNPARSEABLE_INSTR_NAMES = ["PSRLW:PSRLD:PSRLQ", "PSLLW:PSLLD:PSLLQ", "MOVBE"]
# Some files contain instructions which cannot be parsed and which compilers are unlikely to emit
IGNORED_FILE_NAMES = [
    "._404",
    "404",
    "index",
    # SGX pseudo-instructions
    "EADD",
    "EACCEPT",
    "EAUG",
    "EACCEPTCOPY",
    "EDECVIRTCHILD",
    "EINCVIRTCHILD",
    "EINIT",
    "ELDB:ELDU:ELDBC:ELBUC",
    "EMODPE",
    "EMODPR",
    "EMODT",
    "ERDINFO",
    "ESETCONTEXT",
    "ETRACKC",
    "EBLOCK",
    "ECREATE",
    "EDBGRD",
    "EDBGWR",
    "EENTER",
    "EEXIT",
    "EEXTEND",
    "EGETKEY",
    "ELDB",
    "ELDU",
    "ENCLS",
    "ENCLU",
    "EPA",
    "EREMOVE",
    "EREPORT",
    "ERESUME",
    "ETRACK",
    "EWB",
    # VMX instructions
    "INVEPT",
    "INVVPID",
    "VMCALL",
    "VMCLEAR",
    "VMFUNC",
    "VMLAUNCH",
    "VMLAUNCH:VMRESUME",
    "VMPTRLD",
    "VMPTRST",
    "VMREAD",
    "VMRESUME",
    "VMWRITE",
    "VMXOFF",
    "VMXON",
    # Other instructions
    "INVLPG",
    "LAHF",
    "RDMSR",
    "SGDT",
    # Unparsable instructions
    # These instructions should be supported in the future
    "MONITOR",
    "MOVDQ2Q",
    "MFENCE",
]
# Some instructions are defined in multiple files. We ignore a specific set of the
# duplicates here.
IGNORED_DUPLICATES = [
    "MOV-1",  # move to control reg
    "MOV-2",  # move to debug reg
    "CMPSD",  # compare doubleword (defined in CMPS:CMPSB:CMPSW:CMPSD:CMPSQ)
    "MOVQ",  # defined in MOVD:MOVQ
    "MOVSD",  # defined in MOVS:MOVSB:MOVSW:MOVSD:MOVSQ
    "VPBROADCASTB:VPBROADCASTW:VPBROADCASTD:VPBROADCASTQ",  # defined in VPBROADCAST
    "VGATHERDPS:VGATHERDPD",
    "VGATHERQPS:VGATHERQPD",
    "VPGATHERDD:VPGATHERQD",
    "VPGATHERDQ:VPGATHERQQ",
]
# Where to extract the asmdoc archive.
ASMDOC_DIR = "asm-docs"
ARCHIVE_URL = "https://www.felixcloutier.com/x86/x86.tbz2"
ARCHIVE_NAME = "x86.tbz2"


class Instruction(object):
    def __init__(self, name, variants, variant_descriptions, tooltip, body):
        self.name = name
        self.variants = variants
        self.variant_descriptions = variant_descriptions
        self.tooltip = tooltip.rstrip(": ,")
        self.body = body

    def __str__(self):
        return f"Instruction<{self.name}>"


def get_url_for_instruction(instr):
    return f"https://www.felixcloutier.com/x86/{urllib.parse.quote(instr.name)}.html"


def download_asm_doc_archive(downloadfolder):
    if not os.path.exists(downloadfolder):
        print(f"Creating {downloadfolder} as download folder")
        os.makedirs(downloadfolder)
    elif not os.path.isdir(downloadfolder):
        print(f"Error: download folder {downloadfolder} is not a directory")
        sys.exit(1)
    archive_name = os.path.join(downloadfolder, ARCHIVE_NAME)
    print("Downloading archive...")
    urllib.request.urlretrieve(ARCHIVE_URL, archive_name)


def extract_asm_doc_archive(downloadfolder, inputfolder):
    print("Extracting file...")
    if os.path.isdir(os.path.join(inputfolder, "html")):
        for root, dirs, files in os.walk(os.path.join(inputfolder, "html")):
            for file in files:
                if os.path.splitext(file)[1] == ".html":
                    os.remove(os.path.join(root, file))
    tar = tarfile.open(os.path.join(downloadfolder, ARCHIVE_NAME))
    tar.extractall(path=inputfolder)


def strip_non_instr(i):
    # removes junk from encodings where the opcode is in the middle
    # of prefix stuff. e.g.
    # 66 0f 38 30 /r PMOVZXBW xmm1, xmm2/m64
    return STRIP_PREFIX.sub("", i)


def instr_name(i):
    match = INSTRUCTION_RE.match(strip_non_instr(i))
    if match:
        return match.group(1)


def get_description_paragraphs(document_soup):
    description_header_node = document_soup.find(id="description")
    i = 0
    description_paragraph_node = description_header_node.next_sibling.next_sibling
    description_paragraphs = []
    while i < MAX_DESC_PARAS and len(description_paragraph_node.text) > 20:
        if description_paragraph_node.name == "p":
            description_paragraphs.append(description_paragraph_node)
            i = i + 1
            # Move two siblings forward. Next sibling is the line feed.
        description_paragraph_node = (
            description_paragraph_node.next_sibling.next_sibling
        )
    return description_paragraphs


def parse(filename, f):
    doc = BeautifulSoup(f, "html.parser")
    if doc.table is None:
        print(f"{filename}: Failed to find table")
        return None
    table = read_table(doc.table)
    variants = set()
    variant_descriptions = {}

    for inst in table:
        for op_key in [
            "Opcode/Instruction",
            "OpcodeInstruction",
            "Opcode Instruction",
            "Opcode*/Instruction",
            "Opcode / Instruction",
            "Instruction",
        ]:
            if op_key not in inst:
                continue

            variant = instr_name(inst[op_key])
            if not variant:
                continue

            variants.add(variant)
            variant_descriptions[variant] = inst.get("Description")
            break

    if not variants:
        if filename in UNPARSEABLE_INSTR_NAMES:
            for name in filename.split(":"):
                variants.add(name)
        else:
            print(f"{filename}: Failed to read instruction table")
            return None

    description_paragraphs = get_description_paragraphs(doc)

    for para in description_paragraphs:
        for link in para.find_all("a"):
            # this urljoin will only ensure relative urls are prefixed
            # if a url is already absolute it does nothing
            link["href"] = urllib.parse.urljoin(
                "https://www.felixcloutier.com/x86/", link["href"]
            )
            link["target"] = "_blank"
            link["rel"] = "noreferrer noopener"

    return Instruction(
        filename,
        variants,
        variant_descriptions,
        description_paragraphs[0].text.strip(),
        "".join(map(lambda x: str(x), description_paragraphs)).strip(),
    )


def read_table(table):
    # Finding all 'th' is not enough, since some headers are 'td'.
    # Instead, walk through all children of the first 'tr', filter out those
    # that are only whitespace, keep `get_text()` on the others.
    headers = list(
        map(
            lambda th: th.get_text(),
            filter(lambda th: str(th).strip(), table.tr.children),
        )
    )

    result = []
    if headers:
        # common case
        for row in table.find_all("tr"):
            obj = {}
            for column, name in zip(row.find_all("td"), headers):
                # Remove '\n's in names that contain it.
                obj[name.replace("\n", "")] = column.get_text()
            if obj:
                result.append(obj)
    else:
        # Cases like BEXTR and BZHI
        rows = table.find_all("tr")
        if len(rows) != 1:
            return []
        obj = {}
        for td in rows[0].find_all("td"):
            header = td.p.strong.get_text()
            td.p.strong.decompose()
            obj[header] = td.get_text()
        result.append(obj)

    return result


def parse_html(directory):
    print("Parsing instructions...")
    instructions = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".html"):
                with open(os.path.join(root, file), encoding="utf-8") as f2:
                    name = os.path.splitext(file)[0]
                    if name in IGNORED_DUPLICATES or name in IGNORED_FILE_NAMES:
                        continue
                    try:
                        instruction = parse(name, f2)
                        if not instruction:
                            continue
                        patch_instruction(instruction)
                        instructions.append(instruction)
                    except Exception as e:
                        print(f"Error parsing {name}:\n{e}")
    return instructions


def self_test(instructions, directory):
    # For each generated instruction, check that there is a path to a file in
    # the documentation.
    directory = os.path.join(directory, "html")
    ok = True
    for inst in instructions:
        if not os.path.isfile(os.path.join(directory, inst.name + ".html")):
            print(f"Warning: {inst.name} has not file associated")
            ok = False
    return ok


def patch_instruction(instruction):
    if instruction.name == "ADDSS":
        print("\nPatching ADDSS")
        print(
            "REMINDER: Check if https://github.com/compiler-explorer/compiler-explorer/issues/2380 is still relevant\n"
        )

        old_body = instruction.body
        old_tooltip = instruction.tooltip
        instruction.body = old_body.replace(
            "stores the double-precision", "stores the single-precision"
        )
        instruction.tooltip = old_tooltip.replace(
            "stores the double-precision", "stores the single-precision"
        )


def trim_str(str, max_len=255):
    return (str[:max_len] + "...") if len(str) > max_len else str


def main():
    args = parser.parse_args()
    print(f"Called with: {args}")

    # If we don't have the html folder already...
    if not os.path.isdir(os.path.join(args.inputfolder, "html")):
        # We don't, try with the compressed file
        if not os.path.isfile(os.path.join(args.downloadfolder, "x86.tbz2")):
            # We can't find that either. Download it
            try:
                download_asm_doc_archive(args.downloadfolder)
                extract_asm_doc_archive(args.downloadfolder, args.inputfolder)
            except IOError as e:
                print("Error when downloading archive:")
                print(e)
                sys.exit(1)
        else:
            # We have a file already downloaded
            extract_asm_doc_archive(args.downloadfolder, args.inputfolder)

    instructions = parse_html(args.inputfolder)
    instructions.sort(key=lambda b: b.name)

    all_inst = set()
    for inst in instructions:
        if not all_inst.isdisjoint(inst.variants):
            print(
                f"Overlap in instruction variants: {inst.variants.intersection(all_inst)} for {inst.name}"
            )
        all_inst = all_inst.union(inst.variants)

    if not self_test(instructions, args.inputfolder):
        print("Tests do not pass. Not writing output file. Aborting.")
        sys.exit(3)

    print(f"Writing {len(instructions)} instructions")

    autocomplete_path = os.path.join(args.outputdir, "autocomplete.json")
    with open(autocomplete_path, "w") as f:
        autocomplete = {}
        for inst in instructions:
            autocomplete[inst.name.upper()] = {
                "_": inst.name.lower(),
                "*": inst.tooltip,
            }
            for variant in inst.variants:
                autocomplete[variant.upper()] = {
                    "_": inst.name.lower(),
                    "*": inst.variant_descriptions.get(variant, trim_str(inst.tooltip)),
                }
        json.dump(autocomplete, f, separators=(",", ":"))

    full_path = os.path.join(args.outputdir, "full.json")
    with open(full_path, "w") as f:
        full = []
        for inst in instructions:
            full.append(
                {
                    "id": inst.name.lower(),
                    "variants": list(inst.variants),
                    "variant_descriptions": inst.variant_descriptions,
                    "text": inst.body,
                    "href": get_url_for_instruction(inst),
                }
            )
        json.dump(full, f, indent=2)


if __name__ == "__main__":
    main()
