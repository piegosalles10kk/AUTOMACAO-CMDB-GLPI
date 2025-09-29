@echo off
setlocal

echo Navegando para a pasta Automacao-glpi...
cd Automacao-glpi

echo Verificando dependencias...
if not exist node_modules (
    echo A pasta node_modules nao foi encontrada. Instalando dependencias...
    npm install
) else (
    echo A pasta node_modules ja existe.
)

echo Iniciando a aplicacao...
node automacaoGlpi.js

endlocal
pause