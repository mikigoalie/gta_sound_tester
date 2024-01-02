--[[ Main ]]--
fx_version 'cerulean'
game 'gta5'
lua54 'yes'

--[[ Description ]]--
author 'mikigoalie @ https://dsc.gg/lsrpscripts'

ui_page 'web/index.html'

files { 'web/**', 'soundNames.json' }

shared_scripts { '@ox_lib/init.lua' }
client_script 'client.lua'
