// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract DeCloudFiles { 

    struct FileDetails {
        string hashValueOfFile; 
        string nameOfFile;  
        string typeOfFile;
        string[] storedIn;
        uint256 splitInto;
        uint256 uploadDate;
        uint256 fileSize;
    }

    struct TransactionDetails {
        uint256 amount;
        uint256 date;
        bool isPaid;
    }

    mapping (address => FileDetails[]) files;
    mapping (address => uint256) noOfFiles;
    mapping (address => TransactionDetails[]) amountGainedBy; 

    event FileAdded();
    event FundsWithdrawn(address to);

    function addFile (string memory filehash, string memory fileName, string memory fileType,string[] memory storedIn,address[] memory storageOwners,uint256 numberOfStorageOwner,uint256 splitInto, uint256 uploadDate,uint256 fileSize) public payable {
        files[msg.sender].push(FileDetails(filehash,fileName,fileType,storedIn,splitInto,uploadDate,fileSize));
        noOfFiles[msg.sender]++;

        for(uint i = 0 ; i < numberOfStorageOwner ; i++){
            amountGainedBy[storageOwners[i]].push(TransactionDetails(msg.value / numberOfStorageOwner ,uploadDate, false));
        }
        emit FileAdded();
    }

    function getFile(uint256 position) public view returns (string memory, string memory, string memory, string[] memory, uint256, uint256, uint256) {
        FileDetails memory file = files[msg.sender][position];
        return ( file.hashValueOfFile, file.nameOfFile, file.typeOfFile, file.storedIn,file.splitInto,file.uploadDate,file.fileSize);
    }

    function getNoOfFile() public view returns (uint256){
        return files[msg.sender].length;
    }

    function getNoOfPaidAmount() public view returns (uint256){
        return amountGainedBy[msg.sender].length;
    }

    function getAmount(uint256 position) public view returns (uint256, uint256, bool){
        TransactionDetails memory transac = amountGainedBy[msg.sender][position];
        return (transac.amount,transac.date,transac.isPaid);
    }

    function getPaid(uint256 position) public payable{
        TransactionDetails memory transac = amountGainedBy[msg.sender][position];

        require(transac.isPaid == false,"Already Paid");
        require(transac.amount > 0,"Insufficient money");
        // require(block.timestamp > (2629746 + transac.date),'Please wait till a month');

        require(payable(msg.sender).send(transac.amount) == true,"Transaction Failed");
        
        amountGainedBy[msg.sender][position].isPaid = true;
        emit FundsWithdrawn(msg.sender);
    }

    function getRefund(address storageOwner,uint uploadDate) public payable {
        TransactionDetails memory transac;
        uint temp = amountGainedBy[storageOwner].length;
        for(uint i = 0 ; i < temp;i++){
            transac = amountGainedBy[storageOwner][i];
            if(transac.date == uploadDate){
                require(transac.isPaid == false,"Already Paid");
                require(transac.amount > 0,"Insufficient money");
                // require(block.timestamp > (2629746 + transac.date),'Please wait till a month');

                require(payable(msg.sender).send(transac.amount) == true,"Transaction Failed");
        
                amountGainedBy[msg.sender][i].isPaid = true;
                emit FundsWithdrawn(storageOwner);
            }
        }
    } 
}
