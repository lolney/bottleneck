if swapon -s | grep '/dev/xvdf'; then  
    echo "Don't need to create swap"
else
    sudo mkswap /dev/xvdf
    sudo swapon /dev/xvdf
fi
