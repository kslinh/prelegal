"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-06-24 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    op.create_table('documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('user_email', sa.String(), nullable=True),
        sa.Column('template_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('customizations', sa.Text(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_documents_user_id', 'documents', ['user_id'], unique=False)
    op.create_index('ix_documents_template_id', 'documents', ['template_id'], unique=False)
    op.create_index('ix_documents_user_email', 'documents', ['user_email'], unique=False)
    op.create_index('ix_documents_user_id_updated_at', 'documents', ['user_id', 'updated_at'], unique=False)

    op.create_table('favorites',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('user_email', sa.String(), nullable=True),
        sa.Column('template_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_favorites_user_id', 'favorites', ['user_id'], unique=False)
    op.create_index('ix_favorites_template_id', 'favorites', ['template_id'], unique=False)
    op.create_index('ix_favorites_user_email', 'favorites', ['user_email'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_favorites_user_email', table_name='favorites')
    op.drop_index('ix_favorites_template_id', table_name='favorites')
    op.drop_index('ix_favorites_user_id', table_name='favorites')
    op.drop_table('favorites')
    op.drop_index('ix_documents_user_id_updated_at', table_name='documents')
    op.drop_index('ix_documents_user_email', table_name='documents')
    op.drop_index('ix_documents_template_id', table_name='documents')
    op.drop_index('ix_documents_user_id', table_name='documents')
    op.drop_table('documents')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
