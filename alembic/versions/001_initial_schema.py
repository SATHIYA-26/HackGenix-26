"""Initial database schema for businesses, youtube metadata, and normalized feedback

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-25 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. businesses table
    op.create_table(
        'businesses',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_businesses_name'), 'businesses', ['name'], unique=False)

    # 2. youtube_channels table
    op.create_table(
        'youtube_channels',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('business_id', sa.Uuid(), nullable=False),
        sa.Column('youtube_channel_id', sa.String(length=255), nullable=False),
        sa.Column('channel_name', sa.String(length=255), nullable=True),
        sa.Column('channel_url', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_youtube_channels_business_id'), 'youtube_channels', ['business_id'], unique=False)
    op.create_index(op.f('ix_youtube_channels_youtube_channel_id'), 'youtube_channels', ['youtube_channel_id'], unique=False)

    # 3. youtube_videos table
    op.create_table(
        'youtube_videos',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('business_id', sa.Uuid(), nullable=False),
        sa.Column('youtube_video_id', sa.String(length=255), nullable=False),
        sa.Column('youtube_channel_id', sa.String(length=255), nullable=True),
        sa.Column('title', sa.String(length=500), nullable=True),
        sa.Column('video_url', sa.String(length=500), nullable=True),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_youtube_videos_business_id'), 'youtube_videos', ['business_id'], unique=False)
    op.create_index(op.f('ix_youtube_videos_youtube_video_id'), 'youtube_videos', ['youtube_video_id'], unique=False)

    # 4. feedback table
    op.create_table(
        'feedback',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('business_id', sa.Uuid(), nullable=False),
        sa.Column('source', sa.String(length=50), nullable=False),
        sa.Column('source_type', sa.String(length=50), nullable=False),
        sa.Column('external_id', sa.String(length=255), nullable=False),
        sa.Column('parent_external_id', sa.String(length=255), nullable=True),
        sa.Column('author_name', sa.String(length=255), nullable=True),
        sa.Column('author_url', sa.String(length=500), nullable=True),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('rating_scale', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('source_url', sa.String(length=500), nullable=True),
        sa.Column(
            'metadata',
            sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'),
            nullable=True
        ),
        sa.Column('ingested_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('business_id', 'source', 'external_id', name='uq_feedback_business_source_external')
    )
    op.create_index(op.f('ix_feedback_business_id'), 'feedback', ['business_id'], unique=False)
    op.create_index(op.f('ix_feedback_external_id'), 'feedback', ['external_id'], unique=False)
    op.create_index(op.f('ix_feedback_parent_external_id'), 'feedback', ['parent_external_id'], unique=False)
    op.create_index(op.f('ix_feedback_source'), 'feedback', ['source'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_feedback_source'), table_name='feedback')
    op.drop_index(op.f('ix_feedback_parent_external_id'), table_name='feedback')
    op.drop_index(op.f('ix_feedback_external_id'), table_name='feedback')
    op.drop_index(op.f('ix_feedback_business_id'), table_name='feedback')
    op.drop_table('feedback')

    op.drop_index(op.f('ix_youtube_videos_youtube_video_id'), table_name='youtube_videos')
    op.drop_index(op.f('ix_youtube_videos_business_id'), table_name='youtube_videos')
    op.drop_table('youtube_videos')

    op.drop_index(op.f('ix_youtube_channels_youtube_channel_id'), table_name='youtube_channels')
    op.drop_index(op.f('ix_youtube_channels_business_id'), table_name='youtube_channels')
    op.drop_table('youtube_channels')

    op.drop_index(op.f('ix_businesses_name'), table_name='businesses')
    op.drop_table('businesses')
