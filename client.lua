local interfaceReady = false
local soundIds = {}
RegisterNUICallback('loaded', function(data, cb)
    print('LOADED')
    interfaceReady = true
    cb(1)
end)

local function loaded()
    Wait(500)

    while not interfaceReady do
        Wait(100)
    end

    local loadFile = LoadResourceFile(GetCurrentResourceName(), "soundNames.json")
    local fileContent = json.decode(loadFile)
            SendNUIMessage({ action = "loadSounds", data = fileContent })
end CreateThread(loaded)


RegisterNUICallback('playSound', function(data, cb)
    local soundHandle = GetSoundId()
    soundIds[soundHandle] = { audioName = data.audioName, audioRef = data.audioRef, audioId = data.audioId }

    PlaySoundFrontend(soundHandle, data.audioName, data.audioRef, true)
    ReleaseSoundId(soundHandle)

    CreateThread(function()
        while not HasSoundFinished(soundHandle) do
            Wait(100)
        end

        SendNUIMessage({ action = "soundFinished", soundId = data.audioId })
    end)
    cb(1)
end)

RegisterNUICallback('stopSounds', function(data, cb)
    for id in pairs(soundIds) do
        if not HasSoundFinished(id) then
            StopSound(id)
        end

        id = nil
    end
    cb(1)
end)


RegisterCommand('testsounds', function()
    local hasFocus = IsNuiFocused()
    SetNuiFocus(not hasFocus, not hasFocus)
    SendNUIMessage({ action = "displayInterface", open = not hasFocus })
end)

RegisterNUICallback('closeInterface', function()
    SetNuiFocus(false, false)
end)