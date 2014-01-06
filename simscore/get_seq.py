from simscore.schrodinger.structure import StructureReader

def has_ca (res):
    for a in res.atom:
        if a.pdbname.strip() == "CA":
            return True
    return False

if __name__ == "__main__":
    import sys
    path = sys.argv[1]

    st = StructureReader(path).next()
    
    residues = [{'resnum': res.resnum,
                 'code': res.getCode (),
                 'pdbres': res.pdbres}
                for res in st.residue if has_ca (res)]

    from simplejson import dumps
    print dumps (residues)
