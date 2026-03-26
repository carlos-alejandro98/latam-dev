# *
# *
# * Copyright 2021 (C) LATAM Airlines, S.A. - All Rights Reserved
# * Unauthorized copying of this file, via any medium is strictly prohibited
# *
# * Proprietary and confidential
# *
# * Created on: 7 / 2021
# * Team: Arquitectura (grp_arquitectura-empresarial@latam.com)
# *
# *

FROM <%= redhat_ubi_8_nginx_1 %>

LABEL org.opencontainers.image.version="1.0"
LABEL org.opencontainers.image.vendor="LATAM Airlines, S.A."
LABEL org.opencontainers.image.licenses="Proprietary software"
LABEL org.opencontainers.image.title="template-base"
LABEL org.opencontainers.image.description="Template base de componente"
LABEL org.opencontainers.image.authors="grp_arquitectura-empresarial@latam.com"

## Copy our angular web site to the nginx root
COPY /build/ /opt/app-root/src

## Copy nginx configuration
COPY expo-nginx.conf /opt/app-root/etc/nginx.default.d/expo-nginx.conf


CMD ["nginx", "-g", "daemon off;"]
