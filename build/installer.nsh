!macro customInstall
  ; --- ENTRADA 1: Para clique SOBRE o ícone da pasta ---
  WriteRegStr HKCR "Directory\shell\FolderFlux" "" "Organizar com Perfil Padrão do FolderFlux"
  WriteRegStr HKCR "Directory\shell\FolderFlux" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCR "Directory\shell\FolderFlux\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  ; --- ENTRADA 2: Para clique no FUNDO (background) de uma pasta aberta ---
  WriteRegStr HKCR "Directory\Background\shell\FolderFlux" "" "Organizar com Perfil Padrão do FolderFlux"
  WriteRegStr HKCR "Directory\Background\shell\FolderFlux" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  ; Note a mudança de "%1" para "%V" aqui. É crucial.
  WriteRegStr HKCR "Directory\Background\shell\FolderFlux\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%V"'
!macroend

!macro customUninstall
  ; Remove ambas as chaves do registro durante a desinstalação
  DeleteRegKey HKCR "Directory\shell\FolderFlux"
  DeleteRegKey HKCR "Directory\Background\shell\FolderFlux"
!macroend