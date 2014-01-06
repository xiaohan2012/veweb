
pdbs=$(cat pdb-list.txt)

if [ ! -d pdbs ]; then
    mkdir pdbs
fi

for pdb in $pdbs
do
    echo $pdb
    curl -o pdbs/$pdb.pdb "http://www.rcsb.org/pdb/download/downloadFile.do?fileFormat=pdb&compression=NO&structureId=$pdb"
done